import { IQueueSummary } from '../../ACDQueues';
import { ILivechatAgent } from '../../ILivechatAgent';
import { IRoom } from '../../IRoom';
import { IQueueMembershipDetails, IVoipExtensionWithAgentInfo } from '../../IVoipExtension';
import { IManagementServerConnectionStatus } from '../../IVoipServerConnectivityStatus';
import { IRegistrationInfo } from '../../voip/IRegistrationInfo';
import { VoipClientEvents } from '../../voip/VoipClientEvents';
import { PaginatedResult } from '../helpers/PaginatedResult';

export type VoipEndpoints = {
	'connector.extension.getRegistrationInfoByUserId': {
		GET: (params: { id: string }) => IRegistrationInfo;
	};
	'voip/queues.getSummary': {
		GET: () => { summary: IQueueSummary[] };
	};
	'voip/queues.getQueuedCallsForThisExtension': {
		GET: (params: { extension: string }) => IQueueMembershipDetails;
	};
	'omnichannel/extensions': {
		GET: () => PaginatedResult<{ extensions: IVoipExtensionWithAgentInfo[] }>;
	};
	'voip/events': {
		POST: (params: { event: VoipClientEvents; rid: string; comment?: string }) => void;
	};
	'voip/room': {
		GET: (params: { token: string; agentId: ILivechatAgent['_id'] }) => { room: IRoom; newRoom: boolean };
	};
	'voip/managementServer/checkConnection': {
		GET: (params: { host: string; port: string; username: string; password: string }) => IManagementServerConnectionStatus;
	};
	'voip/callServer/checkConnection': {
		GET: (params: { websocketUrl: string; host: string; port: string; path: string }) => IManagementServerConnectionStatus;
	};
};
