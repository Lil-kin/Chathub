import QueryString from 'querystring';
import URL from 'url';

import type { IE2EEMessage, IMessage, IRoom, ISubscription, IUser } from '@rocket.chat/core-typings';
import { isE2EEMessage } from '@rocket.chat/core-typings';
import { Emitter } from '@rocket.chat/emitter';
import EJSON from 'ejson';
import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import type { ReactiveVar as ReactiveVarType } from 'meteor/reactive-var';
import { ReactiveVar } from 'meteor/reactive-var';

import * as banners from '../../../client/lib/banners';
import type { LegacyBannerPayload } from '../../../client/lib/banners';
import { imperativeModal } from '../../../client/lib/imperativeModal';
import { dispatchToastMessage } from '../../../client/lib/toast';
import { mapMessageFromApi } from '../../../client/lib/utils/mapMessageFromApi';
import { waitUntilFind } from '../../../client/lib/utils/waitUntilFind';
import EnterE2EPasswordModal from '../../../client/views/e2e/EnterE2EPasswordModal';
import SaveE2EPasswordModal from '../../../client/views/e2e/SaveE2EPasswordModal';
import { createQuoteAttachment } from '../../../lib/createQuoteAttachment';
import { getMessageUrlRegex } from '../../../lib/getMessageUrlRegex';
import { isTruthy } from '../../../lib/isTruthy';
import { ChatRoom, Subscriptions, Messages } from '../../models/client';
import { settings } from '../../settings/client';
import { getUserAvatarURL } from '../../utils/client';
import { sdk } from '../../utils/client/lib/SDKClient';
import { t } from '../../utils/lib/i18n';
import {
	toString,
	toArrayBuffer,
	joinVectorAndEcryptedData,
	splitVectorAndEcryptedData,
	encryptAES,
	decryptAES,
	generateRSAKey,
	exportJWKKey,
	importRSAKey,
	importRawKey,
	deriveKey,
	generateMnemonicPhrase,
} from './helper';
import { log, logError } from './logger';
import { E2ERoom } from './rocketchat.e2e.room';

import './events.js';

let failedToDecodeKey = false;

type KeyPair = {
	public_key: string | null;
	private_key: string | null;
};

const ROOM_KEY_EXCHANGE_SIZE = 10;

class E2E extends Emitter {
	private started: boolean;

	public enabled: ReactiveVarType<boolean>;

	private _ready: ReactiveVarType<boolean>;

	private instancesByRoomId: Record<IRoom['_id'], E2ERoom>;

	private db_public_key: string | null;

	private db_private_key: string | null;

	public privateKey: CryptoKey | undefined;

	private timeout: ReturnType<typeof setInterval> | null;

	constructor() {
		super();
		this.started = false;
		this.enabled = new ReactiveVar(false);
		this._ready = new ReactiveVar(false);
		this.instancesByRoomId = {};
		this.timeout = null;

		this.on('ready', async () => {
			this._ready.set(true);
			this.log('startClient -> Done');
			this.log('decryptSubscriptions');

			await this.decryptSubscriptions();
			this.log('decryptSubscriptions -> Done');

			await this.initiateKeyDistribution();
			await this.handleAsyncE2EESuggestedKey();
		});
	}

	log(...msg: unknown[]) {
		log('E2E', ...msg);
	}

	error(...msg: unknown[]) {
		logError('E2E', ...msg);
	}

	isEnabled(): boolean {
		return this.enabled.get();
	}

	isReady(): boolean {
		return this.enabled.get() && this._ready.get();
	}

	async handleAsyncE2EESuggestedKey() {
		const subs = Subscriptions.find({ E2ESuggestedKey: { $exists: true } }).fetch();
		await Promise.all(
			subs
				.filter((sub) => sub.E2ESuggestedKey && !sub.E2EKey)
				.map(async (sub) => {
					const e2eRoom = await e2e.getInstanceByRoomId(sub.rid);

					if (!e2eRoom) {
						return;
					}

					if (await e2eRoom.importGroupKey(sub.E2ESuggestedKey)) {
						await e2e.acceptSuggestedKey(sub.rid);
						e2eRoom.keyReceived();
					} else {
						console.warn('Invalid E2ESuggestedKey, rejecting', sub.E2ESuggestedKey);
						await e2e.rejectSuggestedKey(sub.rid);
					}

					sub.encrypted ? e2eRoom.resume() : e2eRoom.pause();
				}),
		);
	}

	async getInstanceByRoomId(rid: IRoom['_id']): Promise<E2ERoom | null> {
		const room = await waitUntilFind(() => ChatRoom.findOne({ _id: rid }));

		if (room.t !== 'd' && room.t !== 'p') {
			return null;
		}

		if (room.encrypted !== true && !room.e2eKeyId) {
			return null;
		}

		if (!this.instancesByRoomId[rid]) {
			this.instancesByRoomId[rid] = new E2ERoom(Meteor.userId(), rid, room.t);
		}

		return this.instancesByRoomId[rid];
	}

	removeInstanceByRoomId(rid: IRoom['_id']): void {
		delete this.instancesByRoomId[rid];
	}

	async persistKeys({ public_key, private_key }: KeyPair, password: string): Promise<void> {
		if (typeof public_key !== 'string' || typeof private_key !== 'string') {
			throw new Error('Failed to persist keys as they are not strings.');
		}

		const encodedPrivateKey = await this.encodePrivateKey(private_key, password);

		if (!encodedPrivateKey) {
			throw new Error('Failed to encode private key with provided password.');
		}

		await sdk.rest.post('/v1/e2e.setUserPublicAndPrivateKeys', {
			public_key,
			private_key: encodedPrivateKey,
		});
	}

	async acceptSuggestedKey(rid: string): Promise<void> {
		await sdk.rest.post('/v1/e2e.acceptSuggestedGroupKey', {
			rid,
		});
	}

	async rejectSuggestedKey(rid: string): Promise<void> {
		await sdk.rest.post('/v1/e2e.rejectSuggestedGroupKey', {
			rid,
		});
	}

	getKeysFromLocalStorage(): KeyPair {
		return {
			public_key: Meteor._localStorage.getItem('public_key'),
			private_key: Meteor._localStorage.getItem('private_key'),
		};
	}

	async startClient(): Promise<void> {
		if (this.started) {
			return;
		}

		this.log('startClient -> STARTED');

		this.started = true;

		let { public_key, private_key } = this.getKeysFromLocalStorage();

		await this.loadKeysFromDB();

		if (!public_key && this.db_public_key) {
			public_key = this.db_public_key;
		}

		if (!private_key && this.db_private_key) {
			try {
				private_key = await this.decodePrivateKey(this.db_private_key);
			} catch (error) {
				this.started = false;
				failedToDecodeKey = true;
				this.openAlert({
					title: "Wasn't possible to decode your encryption key to be imported.", // TODO: missing translation
					html: '<div>Your encryption password seems wrong. Click here to try again.</div>', // TODO: missing translation
					modifiers: ['large', 'danger'],
					closable: true,
					icon: 'key',
					action: async () => {
						await this.startClient();
						this.closeAlert();
					},
				});
				return;
			}
		}

		if (public_key && private_key) {
			await this.loadKeys({ public_key, private_key });
		} else {
			await this.createAndLoadKeys();
		}

		if (!this.db_public_key || !this.db_private_key) {
			await this.persistKeys(this.getKeysFromLocalStorage(), await this.createRandomPassword());
		}

		const randomPassword = Meteor._localStorage.getItem('e2e.randomPassword');
		if (randomPassword) {
			this.openAlert({
				title: () => t('Save_your_encryption_password'),
				html: () => t('Click_here_to_view_and_copy_your_password'),
				modifiers: ['large'],
				closable: false,
				icon: 'key',
				action: () => {
					imperativeModal.open({
						component: SaveE2EPasswordModal,
						props: {
							randomPassword,
							onClose: imperativeModal.close,
							onCancel: () => {
								this.closeAlert();
								imperativeModal.close();
							},
							onConfirm: () => {
								Meteor._localStorage.removeItem('e2e.randomPassword');
								this.closeAlert();
								dispatchToastMessage({ type: 'success', message: t('End_To_End_Encryption_Set') });
								imperativeModal.close();
							},
						},
					});
				},
			});
		}
		this.emit('ready');
	}

	async stopClient(): Promise<void> {
		this.log('-> Stop Client');
		this.closeAlert();

		Meteor._localStorage.removeItem('public_key');
		Meteor._localStorage.removeItem('private_key');
		this.instancesByRoomId = {};
		this.privateKey = undefined;
		this.enabled.set(false);
		this._ready.set(false);
		this.started = false;
		this.timeout && clearTimeout(this.timeout);
	}

	async changePassword(newPassword: string): Promise<void> {
		await this.persistKeys(this.getKeysFromLocalStorage(), newPassword);

		if (Meteor._localStorage.getItem('e2e.randomPassword')) {
			Meteor._localStorage.setItem('e2e.randomPassword', newPassword);
		}
	}

	async loadKeysFromDB(): Promise<void> {
		try {
			const { public_key, private_key } = await sdk.rest.get('/v1/e2e.fetchMyKeys');

			this.db_public_key = public_key;
			this.db_private_key = private_key;
		} catch (error) {
			return this.error('Error fetching RSA keys: ', error);
		}
	}

	async loadKeys({ public_key, private_key }: { public_key: string; private_key: string }): Promise<void> {
		Meteor._localStorage.setItem('public_key', public_key);

		try {
			this.privateKey = await importRSAKey(EJSON.parse(private_key), ['decrypt']);

			Meteor._localStorage.setItem('private_key', private_key);
		} catch (error) {
			return this.error('Error importing private key: ', error);
		}
	}

	async createAndLoadKeys(): Promise<void> {
		// Could not obtain public-private keypair from server.
		let key;
		try {
			key = await generateRSAKey();
			this.privateKey = key.privateKey;
		} catch (error) {
			return this.error('Error generating key: ', error);
		}

		try {
			const publicKey = await exportJWKKey(key.publicKey);

			Meteor._localStorage.setItem('public_key', JSON.stringify(publicKey));
		} catch (error) {
			return this.error('Error exporting public key: ', error);
		}

		try {
			const privateKey = await exportJWKKey(key.privateKey);

			Meteor._localStorage.setItem('private_key', JSON.stringify(privateKey));
		} catch (error) {
			return this.error('Error exporting private key: ', error);
		}

		await this.requestSubscriptionKeys();
	}

	async requestSubscriptionKeys(): Promise<void> {
		await sdk.call('e2e.requestSubscriptionKeys');
	}

	async createRandomPassword(): Promise<string> {
		const randomPassword = await generateMnemonicPhrase(5);
		Meteor._localStorage.setItem('e2e.randomPassword', randomPassword);
		return randomPassword;
	}

	async encodePrivateKey(privateKey: string, password: string): Promise<string | void> {
		const masterKey = await this.getMasterKey(password);

		const vector = crypto.getRandomValues(new Uint8Array(16));
		try {
			const encodedPrivateKey = await encryptAES(vector, masterKey, toArrayBuffer(privateKey));

			return EJSON.stringify(joinVectorAndEcryptedData(vector, encodedPrivateKey));
		} catch (error) {
			return this.error('Error encrypting encodedPrivateKey: ', error);
		}
	}

	async getMasterKey(password: string): Promise<void | CryptoKey> {
		if (password == null) {
			alert('You should provide a password');
		}

		// First, create a PBKDF2 "key" containing the password
		let baseKey;
		try {
			baseKey = await importRawKey(toArrayBuffer(password));
		} catch (error) {
			return this.error('Error creating a key based on user password: ', error);
		}

		// Derive a key from the password
		try {
			return await deriveKey(toArrayBuffer(Meteor.userId()), baseKey);
		} catch (error) {
			return this.error('Error deriving baseKey: ', error);
		}
	}

	async requestPassword(): Promise<string> {
		return new Promise((resolve) => {
			const showModal = () => {
				imperativeModal.open({
					component: EnterE2EPasswordModal,
					props: {
						onClose: imperativeModal.close,
						onCancel: () => {
							failedToDecodeKey = false;
							this.closeAlert();
							imperativeModal.close();
						},
						onConfirm: (password) => {
							resolve(password);
							this.closeAlert();
							imperativeModal.close();
						},
					},
				});
			};

			const showAlert = () => {
				this.openAlert({
					title: () => t('Enter_your_E2E_password'),
					html: () => t('Click_here_to_enter_your_encryption_password'),
					modifiers: ['large'],
					closable: false,
					icon: 'key',
					action() {
						showModal();
					},
				});
			};

			if (failedToDecodeKey) {
				showModal();
			} else {
				showAlert();
			}
		});
	}

	async decodePrivateKey(privateKey: string): Promise<string> {
		const password = await this.requestPassword();

		const masterKey = await this.getMasterKey(password);

		const [vector, cipherText] = splitVectorAndEcryptedData(EJSON.parse(privateKey));

		try {
			const privKey = await decryptAES(vector, masterKey, cipherText);
			return toString(privKey);
		} catch (error) {
			throw new Error('E2E -> Error decrypting private key');
		}
	}

	async decryptMessage(message: IMessage | IE2EEMessage): Promise<IMessage> {
		if (!isE2EEMessage(message) || message.e2e === 'done') {
			return message;
		}

		const e2eRoom = await this.getInstanceByRoomId(message.rid);

		if (!e2eRoom) {
			return message;
		}

		const data = await e2eRoom.decrypt(message.msg);

		if (!data) {
			return message;
		}

		const decryptedMessage: IE2EEMessage = {
			...message,
			msg: data.text,
			e2e: 'done',
		};

		const decryptedMessageWithQuote = await this.parseQuoteAttachment(decryptedMessage);

		return decryptedMessageWithQuote;
	}

	async decryptPendingMessages(): Promise<void> {
		return Messages.find({ t: 'e2e', e2e: 'pending' }).forEach(async ({ _id, ...msg }: IMessage) => {
			Messages.update({ _id }, await this.decryptMessage(msg as IE2EEMessage));
		});
	}

	async decryptSubscription(subscriptionId: ISubscription['_id']): Promise<void> {
		const e2eRoom = await this.getInstanceByRoomId(subscriptionId);
		this.log('decryptSubscription ->', subscriptionId);
		await e2eRoom?.decryptSubscription();
	}

	async decryptSubscriptions(): Promise<void> {
		Subscriptions.find({
			encrypted: true,
		}).forEach((subscription) => this.decryptSubscription(subscription._id));
	}

	openAlert(config: Omit<LegacyBannerPayload, 'id'>): void {
		banners.open({ id: 'e2e', ...config });
	}

	closeAlert(): void {
		banners.closeById('e2e');
	}

	async parseQuoteAttachment(message: IE2EEMessage): Promise<IE2EEMessage> {
		if (!message?.msg) {
			return message;
		}
		const urls = message.msg.match(getMessageUrlRegex()) || [];

		await Promise.all(
			urls.map(async (url) => {
				if (!url.includes(settings.get('Site_Url'))) {
					return;
				}

				const urlObj = URL.parse(url);
				// if the URL doesn't have query params (doesn't reference message) skip
				if (!urlObj.query) {
					return;
				}

				const { msg: msgId } = QueryString.parse(urlObj.query);

				if (!msgId || Array.isArray(msgId)) {
					return;
				}

				const getQuotedMessage = await sdk.rest.get('/v1/chat.getMessage', { msgId });
				const quotedMessage = getQuotedMessage?.message;

				if (!quotedMessage) {
					return;
				}

				const decryptedQuoteMessage = await this.decryptMessage(mapMessageFromApi(quotedMessage));

				message.attachments = message.attachments || [];

				const useRealName = settings.get('UI_Use_Real_Name');
				const quoteAttachment = createQuoteAttachment(
					decryptedQuoteMessage,
					url,
					useRealName,
					getUserAvatarURL(decryptedQuoteMessage.u.username || '') as string,
				);

				message.attachments.push(quoteAttachment);
			}),
		);

		return message;
	}

	async getSuggestedE2EEKeys(usersWaitingForE2EKeys: Record<IRoom['_id'], { _id: IUser['_id']; public_key: string }[]>) {
		const roomIds = Object.keys(usersWaitingForE2EKeys);
		return Object.fromEntries(
			(
				await Promise.all(
					roomIds.map(async (room) => {
						const e2eRoom = await this.getInstanceByRoomId(room);

						if (!e2eRoom) {
							return;
						}
						const usersWithKeys = await e2eRoom.encryptGroupKeyForParticipantsWaitingForTheKeys(usersWaitingForE2EKeys[room]);

						if (!usersWithKeys) {
							return;
						}

						return [room, usersWithKeys];
					}),
				)
			).filter(isTruthy),
		);
	}

	async initiateKeyDistribution() {
		if (this.timeout) {
			return;
		}

		this.timeout = setInterval(async () => {
			const roomIds = ChatRoom.find({
				'usersWaitingForE2EKeys': { $exists: true },
				'usersWaitingForE2EKeys.userId': { $ne: Meteor.userId() },
			}).map((room) => room._id);
			if (!roomIds.length) {
				return;
			}

			const randomRoomIds = _.sampleSize(roomIds, ROOM_KEY_EXCHANGE_SIZE);

			const sampleIds: string[] = [];
			for await (const roomId of randomRoomIds) {
				const e2eroom = await this.getInstanceByRoomId(roomId);
				if (!e2eroom?.hasSessionKey()) {
					continue;
				}

				sampleIds.push(roomId);
			}

			const { usersWaitingForE2EKeys = {} } = await sdk.rest.get('/v1/e2e.fetchUsersWaitingForGroupKey', { roomIds: sampleIds });

			if (!Object.keys(usersWaitingForE2EKeys).length) {
				return;
			}

			const userKeysWithRooms = await this.getSuggestedE2EEKeys(usersWaitingForE2EKeys);

			if (!Object.keys(userKeysWithRooms).length) {
				return;
			}

			try {
				await sdk.rest.post('/v1/e2e.provideUsersSuggestedGroupKeys', { usersSuggestedGroupKeys: userKeysWithRooms });
			} catch (error) {
				return this.error('Error providing group key to users: ', error);
			}
		}, 10000);
	}
}

export const e2e = new E2E();
