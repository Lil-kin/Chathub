import { callbacks } from '../../../../../server/utils/hooks';
import CannedResponse from '../../../models/server/models/CannedResponse';
import notifications from '../../../../../server/services/notifications/Notifications';

callbacks.add('livechat.saveAgentDepartment', async (options: Record<string, any>): Promise<any> => {
	const { departmentId, agentsId } = options;
	CannedResponse.findByDepartmentId(departmentId, {}).forEach((response: any) => {
		notifications.streamCannedResponses.emit('canned-responses', { type: 'changed', ...response }, { agentsId });
	});

	return options;
}, callbacks.priority.HIGH, 'canned-responses-on-save-agent-department');
