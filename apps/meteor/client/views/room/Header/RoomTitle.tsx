import type { IRoom } from '@rocket.chat/core-typings';
import { Header } from '@rocket.chat/ui-client';
import React, { ReactElement } from 'react';

import HeaderIconWithRoom from './HeaderIconWithRoom';

type RoomTitleProps = {
	room: IRoom;
};

const RoomTitle = ({ room }: RoomTitleProps): ReactElement => (
	<>
		<HeaderIconWithRoom room={room} />
		<Header.Title>{room.name}</Header.Title>
	</>
);

export default RoomTitle;
