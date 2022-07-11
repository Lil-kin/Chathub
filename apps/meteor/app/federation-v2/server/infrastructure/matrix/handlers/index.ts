import { AbstractMatrixEvent } from '../definitions/AbstractMatrixEvent';
import { MatrixBaseEventHandler } from './BaseEvent';

export class MatrixEventsHandler {
	// eslint-disable-next-line no-empty-function
	constructor(protected handlers: MatrixBaseEventHandler[]) {}

	public async handleEvent(event: AbstractMatrixEvent): Promise<void> {
		console.log({ event });
		const handler = this.handlers.find((handler) => handler.equals(event));
		if (!handler) {
			return console.log(`Could not find handler for ${event.type}`, event);
		}
		return handler.handle(event);
	}
}
