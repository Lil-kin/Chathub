import { api } from '../../../../server/sdk/api';
import { BaseDbWatch } from '../models/_BaseDb';
import { initWatchers } from '../../../../server/modules/watchers/watchers.module';
import { isRunningMs } from '../../../../server/lib/isRunningMs';
import { BaseRaw } from '../../../../server/models/raw/BaseRaw';
import { Messages } from '../../../../server/models/Messages';
import { Users } from '../../../../server/models/Users';
import { Subscriptions } from '../../../../server/models/Subscriptions';
import { Settings } from '../../../../server/models/Settings';
import { LivechatInquiry } from '../../../../server/models/LivechatInquiry';
import { LivechatDepartmentAgents } from '../../../../server/models/LivechatDepartmentAgents';
import { Rooms } from '../../../../server/models/Rooms';
import { UsersSessions } from '../../../../server/models/UsersSessions';
import { Roles } from '../../../../server/models/Roles';
import { LoginServiceConfiguration } from '../../../../server/models/LoginServiceConfiguration';
import { InstanceStatus } from '../../../../server/models/InstanceStatus';
import { IntegrationHistory } from '../../../../server/models/IntegrationHistory';
import { Integrations } from '../../../../server/models/Integrations';
import { EmailInbox } from '../../../../server/models/EmailInbox';
import { PbxEvents } from '../../../../server/models/PbxEvents';
import { Permissions } from '../../../../server/models/Permissions';
import MessagesModel from '../models/Messages';
import UsersModel from '../models/Users';
import SubscriptionsModel from '../models/Subscriptions';
import SettingsModel from '../models/Settings';
import LivechatInquiryModel from '../models/LivechatInquiry';
import LivechatDepartmentAgentsModel from '../models/LivechatDepartmentAgents';
import RoomsModel from '../models/Rooms';

const map = {
	[Messages.col.collectionName]: MessagesModel,
	[Users.col.collectionName]: UsersModel,
	[Subscriptions.col.collectionName]: SubscriptionsModel,
	[Settings.col.collectionName]: SettingsModel,
	[LivechatInquiry.col.collectionName]: LivechatInquiryModel,
	[LivechatDepartmentAgents.col.collectionName]: LivechatDepartmentAgentsModel,
	[Rooms.col.collectionName]: RoomsModel,
};

if (!isRunningMs()) {
	const models = {
		Messages,
		Users,
		Subscriptions,
		Settings,
		LivechatInquiry,
		LivechatDepartmentAgents,
		UsersSessions,
		Permissions,
		Roles,
		Rooms,
		LoginServiceConfiguration,
		InstanceStatus,
		IntegrationHistory,
		Integrations,
		EmailInbox,
		PbxEvents,
	};

	initWatchers(models, api.broadcastLocal.bind(api), (model, fn) => {
		const { collectionName } = (model as BaseRaw<any>).col;

		const meteorModel = map[collectionName] || new BaseDbWatch(collectionName);
		if (!meteorModel) {
			return;
		}

		meteorModel.on('change', fn);
	});
}
