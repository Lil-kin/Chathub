import _ from 'underscore';

RocketChat.sendClientCommand = (user, command, timeout = 5) => {
	const promise = new Promise((resolve, reject) => {
		check(user, Object);
		check(command, Object);
		check(command.key, String);

		const msTimeout = timeout * 1000;

		const clientCommand = {
			u: {
				_id: user._id,
				username: user.username
			},
			cmd: command,
			ts: new Date()
		};

		const id = RocketChat.models.ClientCommands.insert(clientCommand);
		clientCommand._id = id;

		let finished = false;

		const handle = RocketChat.models.ClientCommands.find(id).observeChanges({
			changed: (id, fields) => {
				finished = true;
				handle.stop();
				_.assign(clientCommand, fields);
				resolve(clientCommand);
			}
		});

		setTimeout(() => {
			handle.stop();
			if (finished) {
				return;
			}
			const error = new Meteor.Error('error-client-command-response-timeout',
				`${ _.escape(user.name) } didn't respond to the command in time`, {
					method: 'sendClientCommand',
					command: clientCommand
				});
			reject(error);
		}, msTimeout);
	});

	return promise;
};
