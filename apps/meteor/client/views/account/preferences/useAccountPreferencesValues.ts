import { useUserPreference } from '@rocket.chat/ui-contexts';

export type AccountPreferencesData = {
	language?: string;
	dontAskAgainList?: string[];
	enableAutoAway?: boolean;
	idleTimeLimitH?: number;
	idleTimeLimitM?: number;
	idleTimeLimitS?: number;
	desktopNotificationRequireInteraction?: boolean;
	desktopNotifications?: string;
	pushNotifications?: string;
	emailNotificationMode?: string;
	receiveLoginDetectionEmail?: boolean;
	notifyCalendarEvents?: boolean;
	enableMobileRinging?: boolean;
	unreadAlert?: boolean;
	showThreadsInMainChannel?: boolean;
	alsoSendThreadToChannel?: 'default' | 'always' | 'never';
	useEmojis?: boolean;
	convertAsciiEmoji?: boolean;
	autoImageLoad?: boolean;
	saveMobileBandwidth?: boolean;
	collapseMediaByDefault?: boolean;
	hideFlexTab?: boolean;
	sendOnEnter?: 'normal' | 'alternative' | 'desktop';
	highlights?: string;
	newRoomNotification?: string;
	newMessageNotification?: string;
	muteFocusedConversations?: boolean;

	enableNewMessageTemplate?: boolean;
	displayAvatars?: boolean;
	sidebarShowFavorites?: boolean;
	sidebarShowUnread?: boolean;
	sidebarSortby?: string;
	sidebarViewMode?: string;
	sidebarDisplayAvatar?: boolean;
	sidebarGroupByType?: boolean;
	notificationsSoundVolume?: number;
};

export const useAccountPreferencesValues = (): AccountPreferencesData => {
	const language = useUserPreference<string>('language') || '';
	const userDontAskAgainList = useUserPreference<{ action: string; label: string }[]>('dontAskAgainList') || [];
	const dontAskAgainList = userDontAskAgainList.map(({ action }) => action);
	const enableAutoAway = useUserPreference<boolean>('enableAutoAway');
	const idleTimeLimitH = useUserPreference<number>('idleTimeLimitH');
	const idleTimeLimitM = useUserPreference<number>('idleTimeLimitM');
	const idleTimeLimitS = useUserPreference<number>('idleTimeLimitS');
	const desktopNotificationRequireInteraction = useUserPreference<boolean>('desktopNotificationRequireInteraction');
	const desktopNotifications = useUserPreference<string>('desktopNotifications');
	const pushNotifications = useUserPreference<string>('pushNotifications');
	const emailNotificationMode = useUserPreference<string>('emailNotificationMode');
	const receiveLoginDetectionEmail = useUserPreference<boolean>('receiveLoginDetectionEmail');
	const notifyCalendarEvents = useUserPreference<boolean>('notifyCalendarEvents');
	const enableMobileRinging = useUserPreference<boolean>('enableMobileRinging');

	const unreadAlert = useUserPreference<boolean>('unreadAlert');
	const showThreadsInMainChannel = useUserPreference<boolean>('showThreadsInMainChannel');
	const alsoSendThreadToChannel = useUserPreference<'default' | 'always' | 'never'>('alsoSendThreadToChannel');
	const useEmojis = useUserPreference<boolean>('useEmojis');
	const convertAsciiEmoji = useUserPreference<boolean>('convertAsciiEmoji');
	const autoImageLoad = useUserPreference<boolean>('autoImageLoad');
	const saveMobileBandwidth = useUserPreference<boolean>('saveMobileBandwidth');
	const collapseMediaByDefault = useUserPreference<boolean>('collapseMediaByDefault');
	const hideFlexTab = useUserPreference<boolean>('hideFlexTab');
	const sendOnEnter = useUserPreference<'normal' | 'alternative' | 'desktop'>('sendOnEnter');
	const displayAvatars = useUserPreference<boolean>('displayAvatars');

	const highlights = useUserPreference<string[]>('highlights')?.join(',\n') ?? '';

	const newRoomNotification = useUserPreference<string>('newRoomNotification');
	const newMessageNotification = useUserPreference<string>('newMessageNotification');
	const muteFocusedConversations = useUserPreference<boolean>('muteFocusedConversations');
	const notificationsSoundVolume = useUserPreference<number>('notificationsSoundVolume');

	return {
		language,
		dontAskAgainList,
		enableAutoAway,
		idleTimeLimitH,
		idleTimeLimitM,
		idleTimeLimitS,
		desktopNotificationRequireInteraction,
		desktopNotifications,
		pushNotifications,
		emailNotificationMode,
		receiveLoginDetectionEmail,
		notifyCalendarEvents,
		enableMobileRinging,
		unreadAlert,
		showThreadsInMainChannel,
		alsoSendThreadToChannel,
		useEmojis,
		convertAsciiEmoji,
		autoImageLoad,
		saveMobileBandwidth,
		collapseMediaByDefault,
		hideFlexTab,
		sendOnEnter,
		displayAvatars,
		highlights,
		newRoomNotification,
		newMessageNotification,
		muteFocusedConversations,
		notificationsSoundVolume,
	};
};
