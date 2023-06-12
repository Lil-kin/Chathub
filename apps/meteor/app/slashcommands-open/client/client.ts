import type { RoomType, ISubscription, SlashCommandCallbackParams } from '@rocket.chat/core-typings';
import type { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { roomCoordinator } from '../../../client/lib/rooms/roomCoordinator';
import { slashCommands } from '../../utils/lib/slashCommand';
import { Subscriptions, ChatSubscription } from '../../models/client';
import { sdk } from '../../utils/client/lib/SDKClient';

slashCommands.add({
	command: 'open',
	callback: async function Open({ params }: SlashCommandCallbackParams<'open'>): Promise<void> {
		const dict: Record<string, RoomType[]> = {
			'#': ['c', 'p'],
			'@': ['d'],
		};

		const room = params.trim().replace(/#|@/, '');
		const type = dict[params.trim()[0]] || [];

		const query: Mongo.Selector<ISubscription> = {
			name: room,
			...(type && { t: { $in: type } }),
		};

		const subscription = ChatSubscription.findOne(query);

		if (subscription) {
			roomCoordinator.openRouteLink(subscription.t, subscription, FlowRouter.current().queryParams);
		}

		if (type && type.indexOf('d') === -1) {
			return;
		}
		try {
			await sdk.call('createDirectMessage', room);
			const subscription = Subscriptions.findOne(query);
			if (!subscription) {
				return;
			}
			roomCoordinator.openRouteLink(subscription.t, subscription, FlowRouter.current().queryParams);
		} catch (err: unknown) {
			// noop
		}
	},
	options: {
		description: 'Opens_a_channel_group_or_direct_message',
		params: 'room_name',
		clientOnly: true,
		permission: ['view-c-room', 'view-c-room', 'view-d-room', 'view-joined-room', 'create-d'],
	},
});
