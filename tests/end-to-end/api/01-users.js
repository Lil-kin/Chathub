/* eslint-env mocha */
/* globals expect */
/* eslint no-unused-vars: 0 */

import {getCredentials, api, login, request, credentials, apiEmail, apiUsername, targetUser, log} from '../../data/api-data.js';
import {adminEmail, password} from '../../data/user.js';
import {imgURL} from '../../data/interactions.js';

describe('[Users]', function() {
	this.retries(0);

	before(done => getCredentials(done));

	it('/users.create:', (done) => {
		request.post(api('users.create'))
		.set(credentials)
		.send({
			email: apiEmail,
			name: apiUsername,
			username: apiUsername,
			password,
			active: true,
			roles: ['user'],
			joinDefaultChannels: true,
			verified:true
		})
		.expect('Content-Type', 'application/json')
		.expect(200)
		.expect((res) => {
			expect(res.body).to.have.property('success', true);
			expect(res.body).to.have.deep.property('user.username', apiUsername);
			expect(res.body).to.have.deep.property('user.emails[0].address', apiEmail);
			expect(res.body).to.have.deep.property('user.active', true);
			expect(res.body).to.have.deep.property('user.name', apiUsername);
			targetUser._id = res.body.user._id;
		})
		.end(done);
	});

	it('/users.info:', (done) => {
		request.get(api('users.info'))
		.set(credentials)
		.query({
			userId: targetUser._id
		})
		.expect('Content-Type', 'application/json')
		.expect(200)
		.expect((res) => {
			expect(res.body).to.have.property('success', true);
			expect(res.body).to.have.deep.property('user.username', apiUsername);
			expect(res.body).to.have.deep.property('user.emails[0].address', apiEmail);
			expect(res.body).to.have.deep.property('user.active', true);
			expect(res.body).to.have.deep.property('user.name', apiUsername);
		})
		.end(done);
	});

	it('/users.getPresence:', (done) => {
		request.get(api('users.getPresence'))
		.set(credentials)
		.query({
			userId: targetUser._id
		})
		.expect('Content-Type', 'application/json')
		.expect(200)
		.expect((res) => {
			expect(res.body).to.have.property('success', true);
			expect(res.body).to.have.deep.property('presence', 'offline');
		})
		.end(done);
	});

	it('/users.list:', (done) => {
		request.get(api('users.list'))
		.set(credentials)
		.expect('Content-Type', 'application/json')
		.expect(200)
		.expect((res) => {
			expect(res.body).to.have.property('success', true);
			expect(res.body).to.have.property('count');
			expect(res.body).to.have.property('total');
		})
		.end(done);
	});

	it.skip('/users.list:', (done) => {
		//filtering user list
		request.get(api('users.list'))
		.set(credentials)
		.query({
			name: { '$regex': 'g' }
		})
		.field('username', 1)
		.sort('createdAt', -1)
		.expect(log)
		.expect('Content-Type', 'application/json')
		.expect(200)
		.expect((res) => {
			expect(res.body).to.have.property('success', true);
			expect(res.body).to.have.property('count');
			expect(res.body).to.have.property('total');
		})
		.end(done);
	});

	it.skip('/users.setAvatar:', (done) => {
		request.post(api('users.setAvatar'))
		.set(credentials)
		.attach('avatarUrl', imgURL)
		.expect('Content-Type', 'application/json')
		.expect(200)
		.expect((res) => {
			expect(res.body).to.have.property('success', true);
		})
		.end(done);
	});

	it('/users.update:', (done) => {
		request.post(api('users.update'))
		.set(credentials)
		.send({
			userId: targetUser._id,
			data :{
				email: apiEmail,
				name: `edited${ apiUsername }`,
				username: `edited${ apiUsername }`,
				password,
				active: true,
				roles: ['user']
			}
		})
		.expect('Content-Type', 'application/json')
		.expect(200)
		.expect((res) => {
			expect(res.body).to.have.property('success', true);
			expect(res.body).to.have.deep.property('user.username', `edited${ apiUsername }`);
			expect(res.body).to.have.deep.property('user.emails[0].address', apiEmail);
			expect(res.body).to.have.deep.property('user.active', true);
			expect(res.body).to.have.deep.property('user.name', `edited${ apiUsername }`);
		})
		.end(done);
	});

	describe('[/users.createToken]', () => {
		let user;
		beforeEach((done) => {
			const username = `user.test.${ Date.now() }`;
			const email = `${ username }@rocket.chat`;
			request.post(api('users.create'))
			.set(credentials)
			.send({ email, name: username, username, password })
			.end((err, res) => {
				user = res.body.user;
				done();
			});
		});

		let userCredentials;
		beforeEach((done) => {
			request.post(api('login'))
			.send({
				user: user.username,
				password
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				userCredentials = {};
				userCredentials['X-Auth-Token'] = res.body.data.authToken;
				userCredentials['X-User-Id'] = res.body.data.userId;
			})
			.end(done);
		});
		afterEach(done => {
			request.post(api('users.delete')).set(credentials).send({
				userId: user._id
			}).end(done);
			user = undefined;
		});

		describe('logged as admin:', () => {
			it('should return the user id and a new token', (done) => {
				request.post(api('users.createToken'))
				.set(credentials)
				.send({
					username: user.username
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.deep.property('data.userId', user._id);
					expect(res.body).to.have.deep.property('data.authToken');
				})
				.end(done);
			});
		});

		describe('logged as itself:', () => {
			it('should return the user id and a new token', (done) => {
				request.post(api('users.createToken'))
				.set(userCredentials)
				.send({
					username: user.username
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.deep.property('data.userId', user._id);
					expect(res.body).to.have.deep.property('data.authToken');
				})
				.end(done);
			});
		});

		describe('As an user not allowed:', () => {
			it('should return 401 unauthorized', (done) => {
				request.post(api('users.createToken'))
				.set(userCredentials)
				.send({
					username: 'rocket.cat'
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect((res) => {
					expect(res.body).to.have.property('errorType');
					expect(res.body).to.have.property('error');
				})
				.end(done);
			});
		});

		describe('Not logged in:', () => {
			it('should return 401 unauthorized', (done) => {
				request.post(api('users.createToken'))
				.send({
					username: user.username
				})
				.expect('Content-Type', 'application/json')
				.expect(401)
				.expect((res) => {
					expect(res.body).to.have.property('message');
				})
				.end(done);
			});
		});

		describe('Testing if the returned token is valid:', (done) => {
			it('should return 200', (done) => {
				return request.post(api('users.createToken'))
				.set(credentials)
				.send({ username: user.username })
				.expect('Content-Type', 'application/json')
				.end((err, res) => {
					return err ? done () : request.get(api('me'))
					.set({ 'X-Auth-Token': `${ res.body.data.authToken }`, 'X-User-Id': res.body.data.userId })
					.expect(200)
					.expect((res) => {
						expect(res.body).to.have.property('success', true);
					})
					.end(done);
				});
			});
		});
	});
});
