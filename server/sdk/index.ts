import { AsyncLocalStorage } from 'async_hooks';

import { proxify, proxifyWithWait } from './lib/proxify';
import { IAuthorization } from './types/IAuthorization';
import { IServiceContext } from './types/ServiceClass';
import { IPresence } from './types/IPresence';
import { IAccount } from './types/IAccount';
import { ILicense } from './types/ILicense';
import { IMeteor } from './types/IMeteor';
import { IUiKitCoreAppService } from './types/IUiKitCoreApp';
import { IEnterpriseSettings } from './types/IEnterpriseSettings';
import { IMessageService } from './types/IMessageService';
import { IMessageEnterprise } from './types/IMessageEnterprise';
import { IBannerService } from './types/IBannerService';
import { INPSService } from './types/INPSService';
import { IEnterprise } from './types/IEnterprise';

// TODO think in a way to not have to pass the service name to proxify here as well
export const Authorization = proxifyWithWait<IAuthorization>('authorization');
export const Presence = proxifyWithWait<IPresence>('presence');
export const Account = proxifyWithWait<IAccount>('accounts');
export const License = proxifyWithWait<ILicense>('license');
export const Enterprise = proxifyWithWait<IEnterprise>('enterprise');
export const MeteorService = proxifyWithWait<IMeteor>('meteor');
export const Message = proxifyWithWait<IMessageService>('message');
export const MessageEnterprise = proxifyWithWait<IMessageEnterprise>('ee-message');
export const Banner = proxifyWithWait<IBannerService>('banner');
export const UiKitCoreApp = proxifyWithWait<IUiKitCoreAppService>('uikit-core-app');
export const NPS = proxifyWithWait<INPSService>('nps');

// Calls without wait. Means that the service is optional and the result may be an error
// of service/method not available
export const EnterpriseSettings = proxify<IEnterpriseSettings>('ee-settings');

export const asyncLocalStorage = new AsyncLocalStorage<IServiceContext>();
