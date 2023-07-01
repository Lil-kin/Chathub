import React from 'react';

import { hasPermission, hasAtLeastOnePermission } from '../../../app/authorization/client';
import { settings } from '../../../app/settings/client';
import { defaultFeaturesPreview } from '../../hooks/useFeaturePreview';
import { createSidebarItems } from '../../lib/createSidebarItems';
import AccountFeaturePreviewBadge from './featurePreview/AccountFeaturePreviewBadge';

export const {
	registerSidebarItem: registerAccountSidebarItem,
	unregisterSidebarItem,
	getSidebarItems: getAccountSidebarItems,
	subscribeToSidebarItems: subscribeToAccountSidebarItems,
} = createSidebarItems([
	{
		href: 'preferences',
		i18nLabel: 'Preferences',
		icon: 'customize',
	},
	{
		href: 'profile',
		i18nLabel: 'Profile',
		icon: 'user',
		permissionGranted: (): boolean => settings.get('Accounts_AllowUserProfileChange'),
	},
	{
		href: 'security',
		i18nLabel: 'Security',
		icon: 'lock',
		permissionGranted: (): boolean => settings.get('Accounts_TwoFactorAuthentication_Enabled') || settings.get('E2E_Enable'),
	},
	{
		href: 'integrations',
		i18nLabel: 'Integrations',
		icon: 'code',
		permissionGranted: (): boolean => settings.get('Webdav_Integration_Enabled'),
	},
	{
		href: 'tokens',
		i18nLabel: 'Personal_Access_Tokens',
		icon: 'key',
		permissionGranted: (): boolean => hasPermission('create-personal-access-tokens'),
	},
	{
		href: 'omnichannel',
		i18nLabel: 'Omnichannel',
		icon: 'headset',
		permissionGranted: (): boolean => hasAtLeastOnePermission(['send-omnichannel-chat-transcript', 'request-pdf-transcript']),
	},
	{
		href: 'feature-preview',
		i18nLabel: 'Feature_preview',
		icon: 'eye',
		badge: () => <AccountFeaturePreviewBadge />,
		permissionGranted: () => defaultFeaturesPreview?.length > 0,
	},
]);
