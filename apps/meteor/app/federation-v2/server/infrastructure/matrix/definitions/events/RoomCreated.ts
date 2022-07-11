import { AbstractMatrixEvent, IBaseEventContent } from '../AbstractMatrixEvent';
import { MatrixEventType } from './MatrixEventType';

export interface IMatrixEventContentRoomCreated extends IBaseEventContent {
	creator: string;
	room_version: string;
	was_internally_programatically_created?: boolean;
}

export class MatrixEventRoomCreated extends AbstractMatrixEvent {
	public content: IMatrixEventContentRoomCreated;

	public type = MatrixEventType.ROOM_CREATED;
}
