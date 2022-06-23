import type { IUser } from '@rocket.chat/core-typings';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import { slashCommands, APIClient } from '../../app/utils/client';

let oldUserId: IUser['_id'] | null = null;

Tracker.autorun(async () => {
	const newUserId = Meteor.userId();
	if (oldUserId === null && newUserId) {
		APIClient.get('/v1/commands.list').then((result) => {
			result.commands.forEach((command) => {
				slashCommands.add(command.command, undefined, undefined, undefined, undefined, undefined, undefined, command.appId);
			});
		});
	}

	oldUserId = Meteor.userId();
});
