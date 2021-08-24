import { Logger } from '../../../logger/server';
import { OutOfOfficeRooms, OutOfOfficeUsers } from '../../../models/server';

const logger = new Logger('OutOfOffice');

export async function addToOutOfOfficeRoomsCollection(
	userId: string,
	roomIds: string[],
): Promise<void> {
	await Promise.all(
		roomIds.map(async (roomId) =>
			OutOfOfficeRooms.addUserIdAndRoomId({ userId, roomId }),
		),
	).catch((e) => {
		/* @ts-expect-error */
		logger.error('Error while adding user and room to OutOfOfficeRooms collection',
			e);
	});
}

export async function removeUserIdInPresentRooms(userId: string): Promise<void> {
	const foundOutOfOfficeUser = OutOfOfficeUsers.findOneByUserId(userId, {
		fields: { roomIds: 1 },
	});
	if (foundOutOfOfficeUser && foundOutOfOfficeUser.roomIds) {
		OutOfOfficeRooms.updateAllHavingUserId(userId, foundOutOfOfficeUser.roomIds);
	}
}
