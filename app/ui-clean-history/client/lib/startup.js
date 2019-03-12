import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { TabBar } from '/app/ui-utils';
import { hasAllPermission } from '/app/authorization';

Meteor.startup(() => {
	TabBar.addButton({
		groups: ['channel', 'group', 'direct'],
		id: 'clean-history',
		anonymous: true,
		i18nTitle: 'Prune_Messages',
		icon: 'eraser',
		template: 'cleanHistory',
		order: 250,
		condition: () => hasAllPermission('clean-channel-history', Session.get('openedRoom')),
	});
});
