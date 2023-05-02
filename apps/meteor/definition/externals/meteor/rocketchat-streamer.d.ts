declare module 'meteor/rocketchat:streamer' {
	import type { StreamNames, StreamKeys, StreamerCallbackArgs } from '@rocket.chat/ui-contexts';
	import type { Subscription } from 'meteor/meteor';

	type Connection = any;

	interface IPublication extends Subscription {
		connection: Connection;
		_session: {
			sendAdded(publicationName: string, id: string, fields: Record<string, any>): void;
			userId?: string;
			socket?: {
				send: (payload: string) => void;
			};
		};
		client: {
			meteorClient: boolean;
			ws: any;
			userId?: string;
			send: (payload: string) => void;
		};
	}

	type Rule<K extends string = string> = (this: IPublication, eventName: K, ...args: any) => Promise<boolean | object>;

	interface IRules {
		[k: string]: Rule;
	}

	type DDPSubscription = {
		eventName: string;
		subscription: IPublication;
	};

	type TransformMessage = (
		streamer: IStreamer,
		subscription: DDPSubscription,
		eventName: string,
		args: any[],
		allowed: boolean | object,
	) => string | false;

	interface IStreamer<N extends StreamNames> {
		serverOnly: boolean;

		subscriptions: Set<DDPSubscription>;

		subscriptionName: string;

		allowEmit<K extends StreamKeys<N>>(eventName: K, fn?: Rule | 'all' | 'none' | 'logged'): void;
		allowEmit(rule: Rule<StreamKeys<N>> | 'all' | 'none' | 'logged'): void;

		allowWrite<K extends StreamKeys<N>>(eventName: K | boolean, fn: Rule | 'all' | 'none' | 'logged'): void;
		allowWrite(rule: Rule<StreamKeys<N>> | 'all' | 'none' | 'logged'): void;

		allowRead<K extends StreamKeys<N>>(eventName: K | boolean, fn: Rule | 'all' | 'none' | 'logged'): void;
		allowRead(rule: Rule<StreamKeys<N>> | 'all' | 'none' | 'logged'): void;

		emit<K extends StreamKeys<N>>(event: K, ...data: StreamerCallbackArgs<N, K>): void;

		on<K extends StreamKeys<N>>(event: K, fn: (...data: any[]) => void): void;

		on(event: '_afterPublish', fn: (streamer: IStreamer<N>, ...data: any[]) => void): void;

		removeSubscription(subscription: DDPSubscription, eventName: string): void;

		removeListener(event: string, fn: (...data: any[]) => void): void;

		removeAllListeners(event: string): void;

		__emit(...data: any[]): void;

		_emit(eventName: string, args: any[], origin: Connection | undefined, broadcast: boolean, transform?: TransformMessage): boolean;

		emitWithoutBroadcast<K extends StreamKeys<N>>(event: K, ...data: StreamerCallbackArgs<N, K>): void;

		changedPayload(collection: string, id: string, fields: Record<string, any>): string | false;

		_publish(publication: IPublication, eventName: string, options: boolean | { useCollection?: boolean; args?: any }): Promise<void>;
	}

	interface IStreamerConstructor {
		new <N extends StreamNames>(name: N, options?: { retransmit?: boolean; retransmitToSelf?: boolean }): IStreamer<N>;
	}
}
