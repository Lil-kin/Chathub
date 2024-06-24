import { expect } from 'chai';
import { after, before, describe, it } from 'mocha';

import { getCredentials, api, request, credentials, reservedWords } from '../../data/api-data.js';
import { CI_MAX_ROOMS_PER_GUEST as maxRoomsPerGuest } from '../../data/constants';
import { createIntegration, removeIntegration } from '../../data/integration.helper';
import { updatePermission, updateSetting } from '../../data/permissions.helper';
import { createRoom, deleteRoom } from '../../data/rooms.helper';
import { deleteTeam } from '../../data/teams.helper';
import { testFileUploads } from '../../data/uploads.helper';
import { adminUsername, password } from '../../data/user';
import { createUser, login, deleteUser } from '../../data/users.helper';

function getRoomInfo(roomId) {
	return new Promise((resolve /* , reject*/) => {
		request
			.get(api('channels.info'))
			.set(credentials)
			.query({
				roomId,
			})
			.end((err, req) => {
				resolve(req.body);
			});
	});
}

const channel = {};

describe('[Channels]', function () {
	const apiPublicChannelName = `api-channel-test-${Date.now()}`;

	this.retries(0);

	before((done) => getCredentials(done));

	before('Creating channel', (done) => {
		request
			.post(api('channels.create'))
			.set(credentials)
			.send({
				name: apiPublicChannelName,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.nested.property('channel._id');
				expect(res.body).to.have.nested.property('channel.name', apiPublicChannelName);
				expect(res.body).to.have.nested.property('channel.t', 'c');
				expect(res.body).to.have.nested.property('channel.msgs', 0);
				channel._id = res.body.channel._id;
				channel.name = res.body.channel.name;
			})
			.end(done);
	});

	after(async () => {
		await deleteRoom({ type: 'c', roomId: channel._id });
	});

	it('/channels.invite', async () => {
		const roomInfo = await getRoomInfo(channel._id);

		return request
			.post(api('channels.invite'))
			.set(credentials)
			.send({
				roomId: channel._id,
				userId: 'rocket.cat',
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.nested.property('channel._id');
				expect(res.body).to.have.nested.property('channel.name', apiPublicChannelName);
				expect(res.body).to.have.nested.property('channel.t', 'c');
				expect(res.body).to.have.nested.property('channel.msgs', roomInfo.channel.msgs + 1);
			});
	});

	it('/channels.addModerator', (done) => {
		request
			.post(api('channels.addModerator'))
			.set(credentials)
			.send({
				roomId: channel._id,
				userId: 'rocket.cat',
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/channels.addModerator should fail with missing room Id', (done) => {
		request
			.post(api('channels.addModerator'))
			.set(credentials)
			.send({
				userId: 'rocket.cat',
			})
			.expect('Content-Type', 'application/json')
			.expect(400)
			.expect((res) => {
				expect(res.body).to.have.property('success', false);
			})
			.end(done);
	});

	it('/channels.addModerator should fail with missing user Id', (done) => {
		request
			.post(api('channels.addModerator'))
			.set(credentials)
			.send({
				roomId: channel._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(400)
			.expect((res) => {
				expect(res.body).to.have.property('success', false);
			})
			.end(done);
	});

	it('/channels.removeModerator', (done) => {
		request
			.post(api('channels.removeModerator'))
			.set(credentials)
			.send({
				roomId: channel._id,
				userId: 'rocket.cat',
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/channels.removeModerator should fail on invalid room id', (done) => {
		request
			.post(api('channels.removeModerator'))
			.set(credentials)
			.send({
				userId: 'rocket.cat',
			})
			.expect('Content-Type', 'application/json')
			.expect(400)
			.expect((res) => {
				expect(res.body).to.have.property('success', false);
			})
			.end(done);
	});

	it('/channels.removeModerator should fail on invalid user id', (done) => {
		request
			.post(api('channels.removeModerator'))
			.set(credentials)
			.send({
				roomId: channel._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(400)
			.expect((res) => {
				expect(res.body).to.have.property('success', false);
			})
			.end(done);
	});

	it('/channels.addOwner', (done) => {
		request
			.post(api('channels.addOwner'))
			.set(credentials)
			.send({
				roomId: channel._id,
				userId: 'rocket.cat',
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/channels.removeOwner', (done) => {
		request
			.post(api('channels.removeOwner'))
			.set(credentials)
			.send({
				roomId: channel._id,
				userId: 'rocket.cat',
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/channels.kick', async () => {
		const roomInfo = await getRoomInfo(channel._id);

		return request
			.post(api('channels.kick'))
			.set(credentials)
			.send({
				roomId: channel._id,
				userId: 'rocket.cat',
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.nested.property('channel._id');
				expect(res.body).to.have.nested.property('channel.name', apiPublicChannelName);
				expect(res.body).to.have.nested.property('channel.t', 'c');
				expect(res.body).to.have.nested.property('channel.msgs', roomInfo.channel.msgs + 1);
			});
	});

	it('/channels.invite', async () => {
		const roomInfo = await getRoomInfo(channel._id);

		return request
			.post(api('channels.invite'))
			.set(credentials)
			.send({
				roomId: channel._id,
				userId: 'rocket.cat',
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.nested.property('channel._id');
				expect(res.body).to.have.nested.property('channel.name', apiPublicChannelName);
				expect(res.body).to.have.nested.property('channel.t', 'c');
				expect(res.body).to.have.nested.property('channel.msgs', roomInfo.channel.msgs + 1);
			});
	});

	it('/channels.addOwner', (done) => {
		request
			.post(api('channels.addOwner'))
			.set(credentials)
			.send({
				roomId: channel._id,
				userId: 'rocket.cat',
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/channels.archive', (done) => {
		request
			.post(api('channels.archive'))
			.set(credentials)
			.send({
				roomId: channel._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/channels.unarchive', (done) => {
		request
			.post(api('channels.unarchive'))
			.set(credentials)
			.send({
				roomId: channel._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/channels.close', async () => {
		await request
			.post(api('channels.close'))
			.set(credentials)
			.send({})
			.expect('Content-Type', 'application/json')
			.expect(400)
			.expect((res) => {
				expect(res.body).to.have.property('success', false);
				expect(res.body).to.have.property('errorType', 'invalid-params');
			});
	});

	it('/channels.close', (done) => {
		request
			.post(api('channels.close'))
			.set(credentials)
			.send({
				roomId: channel._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/channels.close', (done) => {
		request
			.post(api('channels.close'))
			.set(credentials)
			.send({
				roomName: apiPublicChannelName,
			})
			.expect('Content-Type', 'application/json')
			.expect(400)
			.expect((res) => {
				expect(res.body).to.have.property('success', false);
				expect(res.body).to.have.property('error', `The channel, ${apiPublicChannelName}, is already closed to the sender`);
			})
			.end(done);
	});

	it('/channels.open', (done) => {
		request
			.post(api('channels.open'))
			.set(credentials)
			.send({
				roomId: channel._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/channels.list', (done) => {
		request
			.get(api('channels.list'))
			.set(credentials)
			.query({
				roomId: channel._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.property('count');
				expect(res.body).to.have.property('total');
			})
			.end(done);
	});

	it('/channels.list.joined', (done) => {
		request
			.get(api('channels.list.joined'))
			.set(credentials)
			.query({
				roomId: channel._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.property('count');
				expect(res.body).to.have.property('total');
			})
			.end(done);
	});
	it('/channels.counters', (done) => {
		request
			.get(api('channels.counters'))
			.set(credentials)
			.query({
				roomId: channel._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.property('joined', true);
				expect(res.body).to.have.property('members');
				expect(res.body).to.have.property('unreads');
				expect(res.body).to.have.property('unreadsFrom');
				expect(res.body).to.have.property('msgs');
				expect(res.body).to.have.property('latest');
				expect(res.body).to.have.property('userMentions');
			})
			.end(done);
	});

	it('/channels.rename', async () => {
		const roomInfo = await getRoomInfo(channel._id);

		function failRenameChannel(name) {
			it(`should not rename a channel to the reserved name ${name}`, (done) => {
				request
					.post(api('channels.rename'))
					.set(credentials)
					.send({
						roomId: channel._id,
						name,
					})
					.expect('Content-Type', 'application/json')
					.expect(400)
					.expect((res) => {
						expect(res.body).to.have.property('success', false);
						expect(res.body).to.have.property('error', `${name} is already in use :( [error-field-unavailable]`);
					})
					.end(done);
			});
		}

		reservedWords.forEach((name) => {
			failRenameChannel(name);
		});

		return request
			.post(api('channels.rename'))
			.set(credentials)
			.send({
				roomId: channel._id,
				name: `EDITED${apiPublicChannelName}`,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.nested.property('channel._id');
				expect(res.body).to.have.nested.property('channel.name', `EDITED${apiPublicChannelName}`);
				expect(res.body).to.have.nested.property('channel.t', 'c');
				expect(res.body).to.have.nested.property('channel.msgs', roomInfo.channel.msgs + 1);
			});
	});

	it('/channels.addAll', (done) => {
		request
			.post(api('channels.addAll'))
			.set(credentials)
			.send({
				roomId: channel._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.nested.property('channel._id');
				expect(res.body).to.have.nested.property('channel.name', `EDITED${apiPublicChannelName}`);
				expect(res.body).to.have.nested.property('channel.t', 'c');
			})
			.end(done);
	});

	it('/channels.addLeader', (done) => {
		request
			.post(api('channels.addLeader'))
			.set(credentials)
			.send({
				roomId: channel._id,
				userId: 'rocket.cat',
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.a.property('success', true);
			})
			.end(done);
	});
	it('/channels.removeLeader', (done) => {
		request
			.post(api('channels.removeLeader'))
			.set(credentials)
			.send({
				roomId: channel._id,
				userId: 'rocket.cat',
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/channels.setJoinCode', async () => {
		const roomInfo = await getRoomInfo(channel._id);

		return request
			.post(api('channels.setJoinCode'))
			.set(credentials)
			.send({
				roomId: channel._id,
				joinCode: '123',
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.nested.property('channel._id');
				expect(res.body).to.have.nested.property('channel.name', `EDITED${apiPublicChannelName}`);
				expect(res.body).to.have.nested.property('channel.t', 'c');
				expect(res.body).to.have.nested.property('channel.msgs', roomInfo.channel.msgs);
			});
	});

	it('/channels.setReadOnly', async () => {
		const roomInfo = await getRoomInfo(channel._id);

		return request
			.post(api('channels.setReadOnly'))
			.set(credentials)
			.send({
				roomId: channel._id,
				readOnly: true,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.nested.property('channel._id');
				expect(res.body).to.have.nested.property('channel.name', `EDITED${apiPublicChannelName}`);
				expect(res.body).to.have.nested.property('channel.t', 'c');
				expect(res.body).to.have.nested.property('channel.msgs', roomInfo.channel.msgs + 1);
			});
	});
	it('/channels.leave', async () => {
		const roomInfo = await getRoomInfo(channel._id);

		return request
			.post(api('channels.leave'))
			.set(credentials)
			.send({
				roomId: channel._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.nested.property('channel._id');
				expect(res.body).to.have.nested.property('channel.name', `EDITED${apiPublicChannelName}`);
				expect(res.body).to.have.nested.property('channel.t', 'c');
				expect(res.body).to.have.nested.property('channel.msgs', roomInfo.channel.msgs + 1);
			});
	});

	describe('[/channels.create]', () => {
		let guestUser;
		let room;

		before(async () => {
			guestUser = await createUser({ roles: ['guest'] });
		});
		after(async () => {
			await deleteUser(guestUser);
		});

		it(`should fail when trying to use an existing room's name`, async () => {
			await request
				.post(api('channels.create'))
				.set(credentials)
				.send({
					name: 'general',
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res) => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.nested.property('errorType', 'error-duplicate-channel-name');
				});
		});

		it('should not add guest users to more rooms than defined in the license', async function () {
			// TODO this is not the right way to do it. We're doing this way for now just because we have separate CI jobs for EE and CE,
			// ideally we should have a single CI job that adds a license and runs both CE and EE tests.
			if (!process.env.IS_EE) {
				this.skip();
			}

			const promises = [];
			for (let i = 0; i < maxRoomsPerGuest; i++) {
				promises.push(
					createRoom({
						type: 'c',
						name: `channel.test.${Date.now()}-${Math.random()}`,
						members: [guestUser.username],
					}),
				);
			}
			const channelIds = (await Promise.all(promises)).map((r) => r.body.channel).map((channel) => channel._id);

			request
				.post(api('channels.create'))
				.set(credentials)
				.send({
					name: `channel.test.${Date.now()}-${Math.random()}`,
					members: [guestUser.username],
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					room = res.body.group;
				})
				.then(() => {
					request
						.get(api('channels.members'))
						.set(credentials)
						.query({
							roomId: room._id,
						})
						.expect('Content-Type', 'application/json')
						.expect(200)
						.expect((res) => {
							expect(res.body).to.have.property('success', true);
							expect(res.body).to.have.property('members').and.to.be.an('array');
							expect(res.body.members).to.have.lengthOf(1);
						});
				});

			await Promise.all(channelIds.map((id) => deleteRoom({ type: 'c', roomId: id })));
		});
	});
	describe('[/channels.info]', () => {
		const testChannelName = `api-channel-test-${Date.now()}`;
		let testChannel = {};
		let channelMessage = {};

		after(async () => {
			await deleteRoom({ type: 'c', roomId: testChannel._id });
		});

		it('creating new channel...', (done) => {
			request
				.post(api('channels.create'))
				.set(credentials)
				.send({
					name: testChannelName,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					testChannel = res.body.channel;
				})
				.end(done);
		});
		it('should fail to create the same channel twice', (done) => {
			request
				.post(api('channels.create'))
				.set(credentials)
				.send({
					name: testChannelName,
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res) => {
					expect(res.body).to.have.property('success', false);
					expect(res.body.error).to.contain('error-duplicate-channel-name');
				})
				.end(done);
		});
		it('should return channel basic structure', (done) => {
			request
				.get(api('channels.info'))
				.set(credentials)
				.query({
					roomId: testChannel._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('channel._id');
					expect(res.body).to.have.nested.property('channel.name', testChannelName);
					expect(res.body).to.have.nested.property('channel.t', 'c');
					expect(res.body).to.have.nested.property('channel.msgs', 0);
				})
				.end(done);
		});
		it('sending a message...', (done) => {
			request
				.post(api('chat.sendMessage'))
				.set(credentials)
				.send({
					message: {
						text: 'Sample message',
						rid: testChannel._id,
					},
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					channelMessage = res.body.message;
				})
				.end(done);
		});
		it('REACTing with last message', (done) => {
			request
				.post(api('chat.react'))
				.set(credentials)
				.send({
					emoji: ':squid:',
					messageId: channelMessage._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
				})
				.end(done);
		});
		it('STARring last message', (done) => {
			request
				.post(api('chat.starMessage'))
				.set(credentials)
				.send({
					messageId: channelMessage._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
				})
				.end(done);
		});
		it('PINning last message', (done) => {
			request
				.post(api('chat.pinMessage'))
				.set(credentials)
				.send({
					messageId: channelMessage._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
				})
				.end(done);
		});
		it('should return channel structure with "lastMessage" object including pin, reactions and star(should be an array) infos', (done) => {
			request
				.get(api('channels.info'))
				.set(credentials)
				.query({
					roomId: testChannel._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('channel').and.to.be.an('object');
					const { channel } = res.body;
					expect(channel).to.have.property('lastMessage').and.to.be.an('object');
					expect(channel.lastMessage).to.have.property('reactions').and.to.be.an('object');
					expect(channel.lastMessage).to.have.property('pinned').and.to.be.a('boolean');
					expect(channel.lastMessage).to.have.property('pinnedAt').and.to.be.a('string');
					expect(channel.lastMessage).to.have.property('pinnedBy').and.to.be.an('object');
					expect(channel.lastMessage).to.have.property('starred').and.to.be.an('array');
				})
				.end(done);
		});
		it('should return all channels messages where the last message of array should have the "star" array with USERS star ONLY', (done) => {
			request
				.get(api('channels.messages'))
				.set(credentials)
				.query({
					roomId: testChannel._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('messages').and.to.be.an('array');
					const { messages } = res.body;
					const lastMessage = messages.filter((message) => message._id === channelMessage._id)[0];
					expect(lastMessage).to.have.property('starred').and.to.be.an('array');
					expect(lastMessage.starred[0]._id).to.be.equal(adminUsername);
				})
				.end(done);
		});
		it('should return all channels messages where the last message of array should have the "star" array with USERS star ONLY even requested with count and offset params', (done) => {
			request
				.get(api('channels.messages'))
				.set(credentials)
				.query({
					roomId: testChannel._id,
					count: 5,
					offset: 0,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('messages').and.to.be.an('array');
					const { messages } = res.body;
					const lastMessage = messages.filter((message) => message._id === channelMessage._id)[0];
					expect(lastMessage).to.have.property('starred').and.to.be.an('array');
					expect(lastMessage.starred[0]._id).to.be.equal(adminUsername);
				})
				.end(done);
		});
	});

	describe('[/channels.online]', () => {
		const createdChannels = [];
		const createdUsers = [];

		const createUserAndChannel = async () => {
			const testUser = await createUser();
			const testUserCredentials = await login(testUser.username, password);
			createdUsers.push(testUser);

			await request.post(api('users.setStatus')).set(testUserCredentials).send({
				message: '',
				status: 'online',
			});

			const roomName = `group-test-${Date.now()}`;

			const roomResponse = await createRoom({
				name: roomName,
				type: 'c',
				members: [testUser.username],
			});
			createdChannels.push(roomResponse.body.channel);

			return {
				testUser,
				testUserCredentials,
				room: roomResponse.body.channel,
			};
		};

		after(async () => {
			await Promise.all([
				createdUsers.map((user) => deleteUser(user)),
				createdChannels.map((channel) => deleteRoom({ type: 'c', roomId: channel._id })),
			]);
		});

		it('should return an error if no query', () =>
			request
				.get(api('channels.online'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res) => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property('error', 'Invalid query');
				}));

		it('should return an error if passing an empty query', () =>
			request
				.get(api('channels.online'))
				.set(credentials)
				.query('query={}')
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res) => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property('error', 'Invalid query');
				}));

		it('should return an array with online members', async () => {
			const { testUser, testUserCredentials, room } = await createUserAndChannel();

			return request
				.get(api('channels.online'))
				.set(testUserCredentials)
				.query(`query={"_id": "${room._id}"}`)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('online');

					const expected = {
						_id: testUser._id,
						username: testUser.username,
					};
					expect(res.body.online).to.deep.include(expected);
				});
		});

		it('should return an empty array if requesting user is not in channel', async () => {
			const outsider = await createUser();
			const outsiderCredentials = await login(outsider.username, password);

			const { testUser, room } = await createUserAndChannel();

			return request
				.get(api('channels.online'))
				.set(outsiderCredentials)
				.query(`query={"_id": "${room._id}"}`)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('online');

					const expected = {
						_id: testUser._id,
						username: testUser.username,
					};
					expect(res.body.online).to.deep.include(expected);
				});
		});
	});

	describe('[/channels.files]', async () => {
		await testFileUploads('channels.files', 'c');
	});

	describe('[/channels.join]', () => {
		let testChannelNoCode;
		let testChannelWithCode;
		let testUser;
		let testUserCredentials;

		before('Create test user', async () => {
			testUser = await createUser();
			testUserCredentials = await login(testUser.username, password);
			testChannelNoCode = (await createRoom({ type: 'c', credentials: testUserCredentials, name: `${apiPublicChannelName}-nojoincode` }))
				.body.channel;
			testChannelWithCode = (
				await createRoom({ type: 'c', credentials: testUserCredentials, name: `${apiPublicChannelName}-withjoincode` })
			).body.channel;
			await updatePermission('edit-room', ['admin', 'owner', 'moderator']);
		});

		after(async () => {
			await Promise.all([
				deleteRoom({ type: 'c', roomId: testChannelNoCode._id }),
				deleteRoom({ type: 'c', roomId: testChannelWithCode._id }),
				deleteUser(testUser),
				updatePermission('edit-room', ['admin', 'owner', 'moderator']),
				updatePermission('join-without-join-code', ['admin', 'bot', 'app']),
			]);
		});

		before('Set code for channel', (done) => {
			request
				.post(api('channels.setJoinCode'))
				.set(testUserCredentials)
				.send({
					roomId: testChannelWithCode._id,
					joinCode: '123',
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
				})
				.end(done);
		});

		it('should fail if invalid channel', (done) => {
			request
				.post(api('channels.join'))
				.set(credentials)
				.send({
					roomId: 'invalid',
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res) => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property('errorType', 'error-room-not-found');
				})
				.end(done);
		});

		describe('code-free channel', () => {
			it('should succeed when joining code-free channel without join code', (done) => {
				request
					.post(api('channels.join'))
					.set(credentials)
					.send({
						roomId: testChannelNoCode._id,
					})
					.expect('Content-Type', 'application/json')
					.expect(200)
					.expect((res) => {
						expect(res.body).to.have.property('success', true);
						expect(res.body).to.have.nested.property('channel._id', testChannelNoCode._id);
					})
					.end(done);
			});
		});

		describe('code-needed channel', () => {
			describe('without join-without-join-code permission', () => {
				before('set join-without-join-code permission to false', async () => {
					await updatePermission('join-without-join-code', []);
				});

				it('should fail when joining code-needed channel without join code and no join-without-join-code permission', (done) => {
					request
						.post(api('channels.join'))
						.set(credentials)
						.send({
							roomId: testChannelWithCode._id,
						})
						.expect('Content-Type', 'application/json')
						.expect(400)
						.expect((res) => {
							expect(res.body).to.have.property('success', false);
							expect(res.body).to.have.nested.property('errorType', 'error-code-required');
						})
						.end(done);
				});

				it('should fail when joining code-needed channel with incorrect join code and no join-without-join-code permission', (done) => {
					request
						.post(api('channels.join'))
						.set(credentials)
						.send({
							roomId: testChannelWithCode._id,
							joinCode: 'WRONG_CODE',
						})
						.expect('Content-Type', 'application/json')
						.expect(400)
						.expect((res) => {
							expect(res.body).to.have.property('success', false);
							expect(res.body).to.have.nested.property('errorType', 'error-code-invalid');
						})
						.end(done);
				});

				it('should succeed when joining code-needed channel with join code', (done) => {
					request
						.post(api('channels.join'))
						.set(credentials)
						.send({
							roomId: testChannelWithCode._id,
							joinCode: '123',
						})
						.expect('Content-Type', 'application/json')
						.expect(200)
						.expect((res) => {
							expect(res.body).to.have.property('success', true);
							expect(res.body).to.have.nested.property('channel._id', testChannelWithCode._id);
						})
						.end(done);
				});
			});

			describe('with join-without-join-code permission', () => {
				before('set join-without-join-code permission to true', async () => {
					await updatePermission('join-without-join-code', ['admin']);
				});

				before('leave channel', (done) => {
					request
						.post(api('channels.leave'))
						.set(credentials)
						.send({
							roomId: testChannelWithCode._id,
						})
						.expect('Content-Type', 'application/json')
						.expect(200)
						.expect((res) => {
							expect(res.body).to.have.property('success', true);
						})
						.end(done);
				});

				it('should succeed when joining code-needed channel without join code and with join-without-join-code permission', (done) => {
					request
						.post(api('channels.join'))
						.set(credentials)
						.send({
							roomId: testChannelWithCode._id,
						})
						.expect('Content-Type', 'application/json')
						.expect(200)
						.expect((res) => {
							expect(res.body).to.have.property('success', true);
							expect(res.body).to.have.nested.property('channel._id', testChannelWithCode._id);
						})
						.end(done);
				});
			});
		});
	});

	describe('/channels.setDescription', () => {
		it('should set the description of the channel with a string', (done) => {
			request
				.post(api('channels.setDescription'))
				.set(credentials)
				.send({
					roomId: channel._id,
					description: 'this is a description for a channel for api tests',
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('description', 'this is a description for a channel for api tests');
				})
				.end(done);
		});
		it('should set the description of the channel with an empty string(remove the description)', (done) => {
			request
				.post(api('channels.setDescription'))
				.set(credentials)
				.send({
					roomId: channel._id,
					description: '',
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('description', '');
				})
				.end(done);
		});
	});

	describe('/channels.setTopic', () => {
		it('should set the topic of the channel with a string', (done) => {
			request
				.post(api('channels.setTopic'))
				.set(credentials)
				.send({
					roomId: channel._id,
					topic: 'this is a topic of a channel for api tests',
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('topic', 'this is a topic of a channel for api tests');
				})
				.end(done);
		});
		it('should set the topic of the channel with an empty string(remove the topic)', (done) => {
			request
				.post(api('channels.setTopic'))
				.set(credentials)
				.send({
					roomId: channel._id,
					topic: '',
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('topic', '');
				})
				.end(done);
		});
	});

	describe('/channels.setAnnouncement', () => {
		it('should set the announcement of the channel with a string', (done) => {
			request
				.post(api('channels.setAnnouncement'))
				.set(credentials)
				.send({
					roomId: channel._id,
					announcement: 'this is an announcement of a channel for api tests',
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('announcement', 'this is an announcement of a channel for api tests');
				})
				.end(done);
		});
		it('should set the announcement of the channel with an empty string(remove the announcement)', (done) => {
			request
				.post(api('channels.setAnnouncement'))
				.set(credentials)
				.send({
					roomId: channel._id,
					announcement: '',
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('announcement', '');
				})
				.end(done);
		});
	});

	describe('/channels.setPurpose', () => {
		it('should set the purpose of the channel with a string', (done) => {
			request
				.post(api('channels.setPurpose'))
				.set(credentials)
				.send({
					roomId: channel._id,
					purpose: 'this is a purpose of a channel for api tests',
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('purpose', 'this is a purpose of a channel for api tests');
				})
				.end(done);
		});
		it('should set the announcement of channel with an empty string(remove the purpose)', (done) => {
			request
				.post(api('channels.setPurpose'))
				.set(credentials)
				.send({
					roomId: channel._id,
					purpose: '',
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('purpose', '');
				})
				.end(done);
		});
	});

	describe('/channels.history', () => {
		it('should return an array of members by channel', (done) => {
			request
				.get(api('channels.history'))
				.set(credentials)
				.query({
					roomId: channel._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('messages');
				})
				.end(done);
		});

		it('should return an array of members by channel even requested with count and offset params', (done) => {
			request
				.get(api('channels.history'))
				.set(credentials)
				.query({
					roomId: channel._id,
					count: 5,
					offset: 0,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('messages');
				})
				.end(done);
		});
	});

	describe('/channels.members', () => {
		let testUser;

		before(async () => {
			testUser = await createUser();
			await updateSetting('Accounts_SearchFields', 'username, name, bio, nickname');
			await request
				.post(api('channels.invite'))
				.set(credentials)
				.send({
					roomId: channel._id,
					userId: testUser._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(200);
		});

		after(async () => {
			await Promise.all([updateSetting('Accounts_SearchFields', 'username, name, bio, nickname'), deleteUser(testUser)]);
		});

		it('should return an array of members by channel', (done) => {
			request
				.get(api('channels.members'))
				.set(credentials)
				.query({
					roomId: channel._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('members').and.to.be.an('array');
					expect(res.body).to.have.property('count');
					expect(res.body).to.have.property('total');
					expect(res.body).to.have.property('offset');
				})
				.end(done);
		});

		it('should return an array of members by channel even requested with count and offset params', (done) => {
			request
				.get(api('channels.members'))
				.set(credentials)
				.query({
					roomId: channel._id,
					count: 5,
					offset: 0,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('members').and.to.be.an('array');
					expect(res.body).to.have.property('count');
					expect(res.body).to.have.property('total');
					expect(res.body).to.have.property('offset');
				})
				.end(done);
		});

		it('should return an filtered array of members by channel', (done) => {
			request
				.get(api('channels.members'))
				.set(credentials)
				.query({
					roomId: channel._id,
					filter: testUser.username,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('members').and.to.be.an('array');
					expect(res.body).to.have.property('count', 1);
					expect(res.body.members[0]._id).to.be.equal(testUser._id);
					expect(res.body).to.have.property('count');
					expect(res.body).to.have.property('total');
					expect(res.body).to.have.property('offset');
				})
				.end(done);
		});
	});

	describe('/channels.getIntegrations', () => {
		let integrationCreatedByAnUser;
		let userCredentials;
		let createdChannel;
		let user;

		before((done) => {
			createRoom({ name: `test-integration-channel-${Date.now()}`, type: 'c' }).end((err, res) => {
				createdChannel = res.body.channel;
				createUser().then((createdUser) => {
					user = createdUser;
					login(user.username, password).then((credentials) => {
						userCredentials = credentials;
						updatePermission('manage-incoming-integrations', ['user']).then(() => {
							updatePermission('manage-own-incoming-integrations', ['user']).then(() => {
								createIntegration(
									{
										type: 'webhook-incoming',
										name: 'Incoming test',
										enabled: true,
										alias: 'test',
										username: 'rocket.cat',
										scriptEnabled: false,
										overrideDestinationChannelEnabled: true,
										channel: `#${createdChannel.name}`,
									},
									userCredentials,
								).then((integration) => {
									integrationCreatedByAnUser = integration;
									done();
								});
							});
						});
					});
				});
			});
		});

		after(async () => {
			await Promise.all([
				deleteRoom({ type: 'c', roomId: createdChannel._id }),
				removeIntegration(integrationCreatedByAnUser._id, 'incoming'),
				updatePermission('manage-incoming-integrations', ['admin']),
				updatePermission('manage-own-incoming-integrations', ['admin']),
				deleteUser(user),
			]);
		});

		it('should return the list of integrations of created channel and it should contain the integration created by user when the admin DOES have the permission', (done) => {
			updatePermission('manage-incoming-integrations', ['admin']).then(() => {
				request
					.get(api('channels.getIntegrations'))
					.set(credentials)
					.query({
						roomId: createdChannel._id,
					})
					.expect('Content-Type', 'application/json')
					.expect(200)
					.expect((res) => {
						expect(res.body).to.have.property('success', true);
						const integrationCreated = res.body.integrations.find(
							(createdIntegration) => createdIntegration._id === integrationCreatedByAnUser._id,
						);
						expect(integrationCreated).to.be.an('object');
						expect(integrationCreated._id).to.be.equal(integrationCreatedByAnUser._id);
						expect(res.body).to.have.property('offset');
						expect(res.body).to.have.property('total');
					})
					.end(done);
			});
		});

		it('should return the list of integrations created by the user only', (done) => {
			updatePermission('manage-own-incoming-integrations', ['admin']).then(() => {
				updatePermission('manage-incoming-integrations', []).then(() => {
					request
						.get(api('channels.getIntegrations'))
						.set(credentials)
						.query({
							roomId: createdChannel._id,
						})
						.expect('Content-Type', 'application/json')
						.expect(200)
						.expect((res) => {
							expect(res.body).to.have.property('success', true);
							const integrationCreated = res.body.integrations.find(
								(createdIntegration) => createdIntegration._id === integrationCreatedByAnUser._id,
							);
							expect(integrationCreated).to.be.equal(undefined);
							expect(res.body).to.have.property('offset');
							expect(res.body).to.have.property('total');
						})
						.end(done);
				});
			});
		});

		it('should return unauthorized error when the user does not have any integrations permissions', (done) => {
			updatePermission('manage-incoming-integrations', []).then(() => {
				updatePermission('manage-own-incoming-integrations', []).then(() => {
					updatePermission('manage-outgoing-integrations', []).then(() => {
						updatePermission('manage-own-outgoing-integrations', []).then(() => {
							request
								.get(api('channels.getIntegrations'))
								.set(credentials)
								.query({
									roomId: createdChannel._id,
								})
								.expect('Content-Type', 'application/json')
								.expect(403)
								.expect((res) => {
									expect(res.body).to.have.property('success', false);
									expect(res.body).to.have.property('error', 'unauthorized');
								})
								.end(done);
						});
					});
				});
			});
		});
	});

	describe('/channels.setCustomFields:', () => {
		let withCFChannel;
		let withoutCFChannel;

		after(async () => {
			await deleteRoom({ type: 'c', roomId: withCFChannel._id });
		});

		it('create channel with customFields', (done) => {
			const customFields = { field0: 'value0' };
			request
				.post(api('channels.create'))
				.set(credentials)
				.send({
					name: `channel.cf.${Date.now()}`,
					customFields,
				})
				.end((err, res) => {
					withCFChannel = res.body.channel;
					done();
				});
		});
		it('get customFields using channels.info', (done) => {
			request
				.get(api('channels.info'))
				.set(credentials)
				.query({
					roomId: withCFChannel._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('channel.customFields.field0', 'value0');
				})
				.end(done);
		});
		it('change customFields', async () => {
			const customFields = { field9: 'value9' };
			return request
				.post(api('channels.setCustomFields'))
				.set(credentials)
				.send({
					roomId: withCFChannel._id,
					customFields,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('channel._id');
					expect(res.body).to.have.nested.property('channel.name', withCFChannel.name);
					expect(res.body).to.have.nested.property('channel.t', 'c');
					expect(res.body).to.have.nested.property('channel.customFields.field9', 'value9');
					expect(res.body).to.have.not.nested.property('channel.customFields.field0', 'value0');
				});
		});
		it('get customFields using channels.info', (done) => {
			request
				.get(api('channels.info'))
				.set(credentials)
				.query({
					roomId: withCFChannel._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('channel.customFields.field9', 'value9');
				})
				.end(done);
		});
		it('delete channels with customFields', (done) => {
			request
				.post(api('channels.delete'))
				.set(credentials)
				.send({
					roomName: withCFChannel.name,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
				})
				.end(done);
		});
		it('create channel without customFields', (done) => {
			request
				.post(api('channels.create'))
				.set(credentials)
				.send({
					name: `channel.cf.${Date.now()}`,
				})
				.end((err, res) => {
					withoutCFChannel = res.body.channel;
					done();
				});
		});
		it('set customFields with one nested field', async () => {
			const customFields = { field1: 'value1' };
			return request
				.post(api('channels.setCustomFields'))
				.set(credentials)
				.send({
					roomId: withoutCFChannel._id,
					customFields,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('channel._id');
					expect(res.body).to.have.nested.property('channel.name', withoutCFChannel.name);
					expect(res.body).to.have.nested.property('channel.t', 'c');
					expect(res.body).to.have.nested.property('channel.customFields.field1', 'value1');
				});
		});
		it('set customFields with multiple nested fields', async () => {
			const customFields = { field2: 'value2', field3: 'value3', field4: 'value4' };

			return request
				.post(api('channels.setCustomFields'))
				.set(credentials)
				.send({
					roomName: withoutCFChannel.name,
					customFields,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('channel._id');
					expect(res.body).to.have.nested.property('channel.name', withoutCFChannel.name);
					expect(res.body).to.have.nested.property('channel.t', 'c');
					expect(res.body).to.have.nested.property('channel.customFields.field2', 'value2');
					expect(res.body).to.have.nested.property('channel.customFields.field3', 'value3');
					expect(res.body).to.have.nested.property('channel.customFields.field4', 'value4');
					expect(res.body).to.have.not.nested.property('channel.customFields.field1', 'value1');
				});
		});
		it('set customFields to empty object', (done) => {
			const customFields = {};

			request
				.post(api('channels.setCustomFields'))
				.set(credentials)
				.send({
					roomName: withoutCFChannel.name,
					customFields,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('channel._id');
					expect(res.body).to.have.nested.property('channel.name', withoutCFChannel.name);
					expect(res.body).to.have.nested.property('channel.t', 'c');
					expect(res.body).to.have.not.nested.property('channel.customFields.field2', 'value2');
					expect(res.body).to.have.not.nested.property('channel.customFields.field3', 'value3');
					expect(res.body).to.have.not.nested.property('channel.customFields.field4', 'value4');
				})
				.end(done);
		});
		it('set customFields as a string -> should return 400', (done) => {
			const customFields = '';

			request
				.post(api('channels.setCustomFields'))
				.set(credentials)
				.send({
					roomName: withoutCFChannel.name,
					customFields,
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res) => {
					expect(res.body).to.have.property('success', false);
				})
				.end(done);
		});
		it('delete channel with empty customFields', (done) => {
			request
				.post(api('channels.delete'))
				.set(credentials)
				.send({
					roomName: withoutCFChannel.name,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
				})
				.end(done);
		});
	});

	describe('/channels.setDefault', () => {
		let testChannel;
		const name = `setDefault-${Date.now()}`;

		before(async () => {
			testChannel = (await createRoom({ type: 'c', name })).body.channel;
		});

		after(async () => {
			await deleteRoom({ type: 'c', roomId: testChannel._id });
		});

		it('should set channel as default', async () => {
			const roomInfo = await getRoomInfo(testChannel._id);

			return request
				.post(api('channels.setDefault'))
				.set(credentials)
				.send({
					roomId: testChannel._id,
					default: true,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('channel._id');
					expect(res.body).to.have.nested.property('channel.name', name);
					expect(res.body).to.have.nested.property('channel.t', 'c');
					expect(res.body).to.have.nested.property('channel.msgs', roomInfo.channel.msgs);
					expect(res.body).to.have.nested.property('channel.default', true);
				});
		});
		it('should unset channel as default', async () => {
			const roomInfo = await getRoomInfo(testChannel._id);

			return request
				.post(api('channels.setDefault'))
				.set(credentials)
				.send({
					roomId: testChannel._id,
					default: false,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('channel._id');
					expect(res.body).to.have.nested.property('channel.name', name);
					expect(res.body).to.have.nested.property('channel.t', 'c');
					expect(res.body).to.have.nested.property('channel.msgs', roomInfo.channel.msgs);
					expect(res.body).to.have.nested.property('channel.default', false);
				});
		});
	});

	describe('/channels.setType', () => {
		let testChannel;
		const name = `setType-${Date.now()}`;

		before(async () => {
			testChannel = (await createRoom({ type: 'c', name })).body.channel;
		});

		after(async () => {
			await deleteRoom({ type: 'c', roomId: testChannel._id });
		});

		it('should change the type public channel to private', async () => {
			const roomInfo = await getRoomInfo(testChannel._id);

			request
				.post(api('channels.setType'))
				.set(credentials)
				.send({
					roomId: channel._id,
					type: 'p',
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('channel._id');
					expect(res.body).to.have.nested.property('channel.name', name);
					expect(res.body).to.have.nested.property('channel.t', 'p');
					expect(res.body).to.have.nested.property('channel.msgs', roomInfo.channel.msgs + 1);
				});
		});
	});

	describe('/channels.delete:', () => {
		let testChannel;

		before(async () => {
			testChannel = (await createRoom({ type: 'c', name: `channel.test.${Date.now()}` })).body.channel;
		});

		after(async () => {
			await deleteRoom({ type: 'c', roomId: testChannel._id });
		});

		it('/channels.delete', (done) => {
			request
				.post(api('channels.delete'))
				.set(credentials)
				.send({
					roomName: testChannel.name,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
				})
				.end(done);
		});
		it('/channels.info', (done) => {
			request
				.get(api('channels.info'))
				.set(credentials)
				.query({
					roomId: testChannel._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res) => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property('errorType', 'error-room-not-found');
				})
				.end(done);
		});
	});

	describe('/channels.getAllUserMentionsByChannel', () => {
		it('should return an array of mentions by channel', (done) => {
			request
				.get(api('channels.getAllUserMentionsByChannel'))
				.set(credentials)
				.query({
					roomId: channel._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('mentions').and.to.be.an('array');
					expect(res.body).to.have.property('count');
					expect(res.body).to.have.property('offset');
					expect(res.body).to.have.property('total');
				})
				.end(done);
		});
		it('should return an array of mentions by channel even requested with count and offset params', (done) => {
			request
				.get(api('channels.getAllUserMentionsByChannel'))
				.set(credentials)
				.query({
					roomId: channel._id,
					count: 5,
					offset: 0,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('mentions').and.to.be.an('array');
					expect(res.body).to.have.property('count');
					expect(res.body).to.have.property('offset');
					expect(res.body).to.have.property('total');
				})
				.end(done);
		});
	});

	describe('/channels.roles', () => {
		let testChannel;

		before(async () => {
			testChannel = (await createRoom({ type: 'c', name: `channel.roles.test.${Date.now()}` })).body.channel;
		});

		after(async () => {
			await deleteRoom({ type: 'c', roomId: testChannel._id });
		});

		it('/channels.invite', (done) => {
			request
				.post(api('channels.invite'))
				.set(credentials)
				.send({
					roomId: testChannel._id,
					userId: 'rocket.cat',
				})
				.end(done);
		});
		it('/channels.addModerator', (done) => {
			request
				.post(api('channels.addModerator'))
				.set(credentials)
				.send({
					roomId: testChannel._id,
					userId: 'rocket.cat',
				})
				.end(done);
		});
		it('/channels.addLeader', (done) => {
			request
				.post(api('channels.addLeader'))
				.set(credentials)
				.send({
					roomId: testChannel._id,
					userId: 'rocket.cat',
				})
				.end(done);
		});
		it('should return an array of role <-> user relationships in a channel', (done) => {
			request
				.get(api('channels.roles'))
				.set(credentials)
				.query({
					roomId: testChannel._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.a.property('success', true);
					expect(res.body).to.have.a.property('roles').that.is.an('array').that.has.lengthOf(2);

					expect(res.body.roles[0]).to.have.a.property('_id').that.is.a('string');
					expect(res.body.roles[0]).to.have.a.property('rid').that.is.equal(testChannel._id);
					expect(res.body.roles[0]).to.have.a.property('roles').that.is.an('array').that.includes('moderator', 'leader');
					expect(res.body.roles[0]).to.have.a.property('u').that.is.an('object');
					expect(res.body.roles[0].u).to.have.a.property('_id').that.is.a('string');
					expect(res.body.roles[0].u).to.have.a.property('username').that.is.a('string');

					expect(res.body.roles[1]).to.have.a.property('_id').that.is.a('string');
					expect(res.body.roles[1]).to.have.a.property('rid').that.is.equal(testChannel._id);
					expect(res.body.roles[1]).to.have.a.property('roles').that.is.an('array').that.includes('owner');
					expect(res.body.roles[1]).to.have.a.property('u').that.is.an('object');
					expect(res.body.roles[1].u).to.have.a.property('_id').that.is.a('string');
					expect(res.body.roles[1].u).to.have.a.property('username').that.is.a('string');
				})
				.end(done);
		});
	});

	describe('/channels.moderators', () => {
		let testChannel;

		before(async () => {
			testChannel = (await createRoom({ type: 'c', name: `channel.moderators.test.${Date.now()}` })).body.channel;
		});

		after(async () => {
			await deleteRoom({ type: 'c', roomId: testChannel._id });
		});

		it('/channels.invite', (done) => {
			request
				.post(api('channels.invite'))
				.set(credentials)
				.send({
					roomId: testChannel._id,
					userId: 'rocket.cat',
				})
				.end(done);
		});
		it('/channels.addModerator', (done) => {
			request
				.post(api('channels.addModerator'))
				.set(credentials)
				.send({
					roomId: testChannel._id,
					userId: 'rocket.cat',
				})
				.end(done);
		});
		it('should return an array of moderators with rocket.cat as a moderator', (done) => {
			request
				.get(api('channels.moderators'))
				.set(credentials)
				.query({
					roomId: testChannel._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.a.property('success', true);
					expect(res.body).to.have.a.property('moderators').that.is.an('array').that.has.lengthOf(1);
					expect(res.body.moderators[0].username).to.be.equal('rocket.cat');
				})
				.end(done);
		});
	});

	describe('/channels.anonymousread', () => {
		let testChannel;

		before(async () => {
			testChannel = (await createRoom({ type: 'c', name: `channel.anonymousread.test.${Date.now()}` })).body.channel;
		});

		after(async () => {
			await Promise.all([updateSetting('Accounts_AllowAnonymousRead', false), deleteRoom({ type: 'c', roomId: testChannel._id })]);
		});

		it('should return an error when the setting "Accounts_AllowAnonymousRead" is disabled', (done) => {
			updateSetting('Accounts_AllowAnonymousRead', false).then(() => {
				request
					.get(api('channels.anonymousread'))
					.query({
						roomId: testChannel._id,
					})
					.expect('Content-Type', 'application/json')
					.expect(400)
					.expect((res) => {
						expect(res.body).to.have.a.property('success', false);
						expect(res.body).to.have.a.property('error');
						expect(res.body).to.have.a.property('errorType');
						expect(res.body.errorType).to.be.equal('error-not-allowed');
						expect(res.body.error).to.be.equal('Enable "Allow Anonymous Read" [error-not-allowed]');
					})
					.end(done);
			});
		});
		it('should return the messages list when the setting "Accounts_AllowAnonymousRead" is enabled', (done) => {
			updateSetting('Accounts_AllowAnonymousRead', true).then(() => {
				request
					.get(api('channels.anonymousread'))
					.query({
						roomId: testChannel._id,
					})
					.expect('Content-Type', 'application/json')
					.expect(200)
					.expect((res) => {
						expect(res.body).to.have.a.property('success', true);
						expect(res.body).to.have.a.property('messages').that.is.an('array');
					})
					.end(done);
			});
		});
		it('should return the messages list when the setting "Accounts_AllowAnonymousRead" is enabled even requested with count and offset params', (done) => {
			updateSetting('Accounts_AllowAnonymousRead', true).then(() => {
				request
					.get(api('channels.anonymousread'))
					.query({
						roomId: testChannel._id,
						count: 5,
						offset: 0,
					})
					.expect('Content-Type', 'application/json')
					.expect(200)
					.expect((res) => {
						expect(res.body).to.have.a.property('success', true);
						expect(res.body).to.have.a.property('messages').that.is.an('array');
					})
					.end(done);
			});
		});
	});

	describe('/channels.convertToTeam', () => {
		let testChannel;

		before(async () => {
			testChannel = (await createRoom({ type: 'c', name: `channel.convertToTeam.test.${Date.now()}` })).body.channel;
		});

		after(async () => {
			await Promise.all([
				updatePermission('create-team', ['admin', 'user']),
				updatePermission('edit-room', ['admin', 'owner', 'moderator']),
				deleteTeam(credentials, testChannel.name),
			]);
		});

		it('should fail to convert channel if lacking edit-room permission', async () => {
			await updatePermission('create-team', []);
			await updatePermission('edit-room', ['admin']);

			await request
				.post(api('channels.convertToTeam'))
				.set(credentials)
				.send({ channelId: testChannel._id })
				.expect(403)
				.expect((res) => {
					expect(res.body).to.have.a.property('success', false);
				});
		});

		it('should fail to convert channel if lacking create-team permission', async () => {
			await updatePermission('create-team', ['admin']);
			await updatePermission('edit-room', []);

			await request
				.post(api('channels.convertToTeam'))
				.set(credentials)
				.send({ channelId: testChannel._id })
				.expect(403)
				.expect((res) => {
					expect(res.body).to.have.a.property('success', false);
				});
		});

		it(`should return an error when the channel's name and id are sent as parameter`, (done) => {
			request
				.post(api('channels.convertToTeam'))
				.set(credentials)
				.send({
					channelName: testChannel.name,
					channelId: testChannel._id,
				})
				.expect(400)
				.expect((res) => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property('error').include(`must match exactly one schema in oneOf`);
				})
				.end(done);
		});

		it(`should successfully convert a channel to a team when the channel's id is sent as parameter`, async () => {
			await updatePermission('create-team', ['admin']);
			await updatePermission('edit-room', ['admin']);

			await request
				.post(api('channels.convertToTeam'))
				.set(credentials)
				.send({ channelId: testChannel._id })
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.a.property('success', true);
				});
		});

		it(`should successfully convert a channel to a team when the channel's name is sent as parameter`, async () => {
			await request
				.post(api('teams.convertToChannel'))
				.set(credentials)
				.send({ teamName: testChannel.name })
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.a.property('success', true);
				});

			await request
				.post(api('channels.convertToTeam'))
				.set(credentials)
				.send({ channelName: testChannel.name })
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.a.property('success', true);
				});
		});

		it('should fail to convert channel without the required parameters', (done) => {
			request.post(api('channels.convertToTeam')).set(credentials).send({}).expect(400).end(done);
		});

		it("should fail to convert channel if it's already taken", (done) => {
			request
				.post(api('channels.convertToTeam'))
				.set(credentials)
				.send({ channelId: testChannel._id })
				.expect(400)
				.expect((res) => {
					expect(res.body).to.have.a.property('success', false);
				})
				.end(done);
		});
	});

	describe("Setting: 'Use Real Name': true", () => {
		let testChannel;

		before(async () => {
			testChannel = (await createRoom({ type: 'c', name: `channel.anonymousread.test.${Date.now()}` })).body.channel;
		});
		before(async () => {
			await updateSetting('UI_Use_Real_Name', true);

			await request
				.post(api('channels.join'))
				.set(credentials)
				.send({
					roomId: testChannel._id,
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('channel._id', testChannel._id);
				});

			await request
				.post(api('chat.sendMessage'))
				.set(credentials)
				.send({
					message: {
						text: 'Sample message',
						rid: testChannel._id,
					},
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
				});
		});

		after(async () => {
			await Promise.all([
				updateSetting('Accounts_AllowAnonymousRead', false),
				updateSetting('UI_Use_Real_Name', false),
				deleteRoom({ type: 'c', roomId: testChannel._id }),
			]);
		});

		it('/channels.list', (done) => {
			request
				.get(api('channels.list'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('count');
					expect(res.body).to.have.property('total');
					expect(res.body).to.have.property('channels').and.to.be.an('array');

					const retChannel = res.body.channels.find(({ _id }) => _id === testChannel._id);

					expect(retChannel).to.have.nested.property('lastMessage.u.name', 'RocketChat Internal Admin Test');
				})
				.end(done);
		});

		it('/channels.list.joined', (done) => {
			request
				.get(api('channels.list.joined'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('count');
					expect(res.body).to.have.property('total');
					expect(res.body).to.have.property('channels').and.to.be.an('array');

					const retChannel = res.body.channels.find(({ _id }) => _id === testChannel._id);

					expect(retChannel).to.have.nested.property('lastMessage.u.name', 'RocketChat Internal Admin Test');
				})
				.end(done);
		});

		it('/channels.list.join should return empty list when member of no group', async () => {
			const user = await createUser({ joinDefaultChannels: false });
			const newCreds = await login(user.username, password);
			await request
				.get(api('channels.list.joined'))
				.set(newCreds)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('count').that.is.equal(0);
					expect(res.body).to.have.property('total').that.is.equal(0);
					expect(res.body).to.have.property('channels').and.to.be.an('array').and.that.has.lengthOf(0);
				});
		});
	});
});
