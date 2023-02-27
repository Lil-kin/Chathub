import type { IMessage } from '@rocket.chat/core-typings';
import { isThreadMessage } from '@rocket.chat/core-typings';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { ChatRoom } from '../../../app/models/client';
import { RoomHistoryManager } from '../../../app/ui-utils/client';
import { goToRoomById } from './goToRoomById';

/** @deprecated */
export const legacyJumpToMessage = async (message: IMessage) => {
	FlowRouter.setQueryParams({ msg: null });

	if (matchMedia('(max-width: 500px)').matches) {
		(Template.instance() as any)?.tabBar?.close();
	}

	if (isThreadMessage(message) || message.tcount) {
		const { route, queryParams } = FlowRouter.current();
		FlowRouter.go(
			route?.name ?? '/',
			{
				tab: 'thread',
				context: message.tmid || message._id,
				rid: message.rid,
				name: ChatRoom.findOne({ _id: message.rid })?.name ?? '',
			},
			{
				...queryParams,
			},
		);
		return;
	}

	if (Session.get('openedRoom') === message.rid) {
		RoomHistoryManager.getSurroundingMessages(message);
		return;
	}

	await goToRoomById(message.rid);

	setTimeout(() => {
		RoomHistoryManager.getSurroundingMessages(message);
	}, 400);
};
