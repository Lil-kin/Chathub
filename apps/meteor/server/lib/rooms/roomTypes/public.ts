import type { AtLeast, IRoom } from '@rocket.chat/core-typings';
import { isRoomFederated, TEAM_TYPE } from '@rocket.chat/core-typings';
import { Team } from '@rocket.chat/core-services';

import { Federation } from '../../../../app/federation-v2/server/Federation';
import { settings } from '../../../../app/settings/server';
import type { IRoomTypeServerDirectives } from '../../../../definition/IRoomTypeConfig';
import { RoomSettingsEnum, RoomMemberActions } from '../../../../definition/IRoomTypeConfig';
import { getPublicRoomType } from '../../../../lib/rooms/roomTypes/public';
import { roomCoordinator } from '../roomCoordinator';

export const PublicRoomType = getPublicRoomType(roomCoordinator);

roomCoordinator.add(PublicRoomType, {
	allowRoomSettingChange(room, setting) {
		if (isRoomFederated(room)) {
			return Federation.isRoomSettingAllowed(room, setting);
		}
		switch (setting) {
			case RoomSettingsEnum.BROADCAST:
				return Boolean(room.broadcast);
			case RoomSettingsEnum.READ_ONLY:
				return Boolean(!room.broadcast);
			case RoomSettingsEnum.REACT_WHEN_READ_ONLY:
				return Boolean(!room.broadcast && room.ro);
			case RoomSettingsEnum.E2E:
				return false;
			case RoomSettingsEnum.SYSTEM_MESSAGES:
			default:
				return true;
		}
	},

	allowMemberAction(_room, action, userId) {
		if (isRoomFederated(_room as IRoom)) {
			return Federation.actionAllowed(_room, action, userId);
		}
		switch (action) {
			case RoomMemberActions.BLOCK:
				return false;
			default:
				return true;
		}
	},

	roomName(room, _userId?) {
		if (room.prid || isRoomFederated(room)) {
			return room.fname;
		}
		if (settings.get('UI_Allow_room_names_with_special_chars')) {
			return room.fname || room.name;
		}
		return room.name;
	},

	isGroupChat(_room) {
		return true;
	},

	includeInDashboard() {
		return true;
	},

	getDiscussionType(room) {
		if (room?.teamId) {
			const team = Promise.await(Team.getOneById(room.teamId, { projection: { type: 1 } }));
			if (team?.type === TEAM_TYPE.PRIVATE) {
				return 'p';
			}
		}
		return 'c';
	},

	includeInRoomSearch() {
		return true;
	},
} as AtLeast<IRoomTypeServerDirectives, 'isGroupChat' | 'roomName'>);
