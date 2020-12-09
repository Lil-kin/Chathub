import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import { callbacks } from '../../../app/callbacks';
import { settings } from '../../../app/settings';
import { Users } from '../../../app/models/client';

Meteor.startup(() => {
	Tracker.autorun(() => {
		const uid = Meteor.userId();
		const options = {
			me: uid && (Users.findOne(uid, { fields: { username: 1 } }) || {}).username,
			pattern: settings.get('UTF8_Names_Validation'),
			useRealName: settings.get('UI_Use_Real_Name'),
		};

		import('../../../app/mentions/client').then(({ createMentionsMessageRenderer }) => {
			const renderMessage = createMentionsMessageRenderer(options);
			callbacks.add('renderMessage', renderMessage, callbacks.priority.MEDIUM, 'mentions-message');
		});
	});
});
