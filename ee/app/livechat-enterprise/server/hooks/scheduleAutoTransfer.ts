import { AutoTransferChatScheduler } from '../lib/AutoTransferChatScheduler';
import { callbacks } from '../../../../../app/callbacks/server';
import { settings } from '../../../../../app/settings/server';
import { LivechatRooms } from '../../../../../app/models/server';

let autoTransferTimeout = 0;

const handleAfterTakeInquiryCallback = async (inquiry: any = {}): Promise<any> => {
	const { rid } = inquiry;
	if (!rid || !rid.trim()) {
		return;
	}

	if (!autoTransferTimeout || autoTransferTimeout <= 0) {
		return inquiry;
	}

	const room = LivechatRooms.findOneById(rid, { autoTransferredAt: 1 });
	if (!room || room.autoTransferredAt) {
		return inquiry;
	}

	await AutoTransferChatScheduler.scheduleRoom(rid, autoTransferTimeout as number);

	return inquiry;
};

const handleAfterSaveMessage = async (message: any = {}, room: any = {}): Promise<any> => {
	const { _id: rid, t, autoTransferredAt } = room;
	const { token } = message;

	const timeout = settings.get('Livechat_auto_transfer_chat_timeout');
	if (!timeout || timeout <= 0) {
		return;
	}

	if (!rid || !message || rid === '' || t !== 'l' || token) {
		return message;
	}

	if (autoTransferredAt) {
		return message;
	}

	// TODO: We can't call this process all time, if need to know wheter the room transfer is scheduled or not
	await AutoTransferChatScheduler.unscheduleRoom(rid);

	return message;
};


settings.get('Livechat_auto_transfer_chat_timeout', function(_, value) {
	autoTransferTimeout = value as number;
	if (!autoTransferTimeout || autoTransferTimeout === 0) {
		callbacks.remove('livechat.afterTakeInquiry', 'livechat-auto-transfer-job-inquiry');
		callbacks.remove('afterSaveMessage', 'livechat-cancel-auto-transfer-job');
		return;
	}

	callbacks.add('livechat.afterTakeInquiry', handleAfterTakeInquiryCallback, callbacks.priority.MEDIUM, 'livechat-auto-transfer-job-inquiry');
	callbacks.add('afterSaveMessage', handleAfterSaveMessage, callbacks.priority.HIGH, 'livechat-cancel-auto-transfer-job');
});
