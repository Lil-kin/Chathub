import { useCurrentRoute, useRoute, usePermission, useSetModal, useTranslation, useSetting } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';

import PageSkeleton from '../../../../../client/components/PageSkeleton';
import UpsellModal from '../../../../../client/components/UpsellModal';
import { useEndpointAction } from '../../../../../client/hooks/useEndpointAction';
import { useIsEnterprise } from '../../../../../client/hooks/useIsEnterprise';
import NotAuthorizedPage from '../../../../../client/views/notAuthorized/NotAuthorizedPage';
import { useHasLicenseModule } from '../../../hooks/useHasLicenseModule';
import EngagementDashboardPage from './EngagementDashboardPage';

const isValidTab = (tab: string | undefined): tab is 'users' | 'messages' | 'channels' =>
	typeof tab === 'string' && ['users', 'messages', 'channels'].includes(tab);

const EngagementDashboardRoute = (): ReactElement | null => {
	const t = useTranslation();
	const canViewEngagementDashboard = usePermission('view-engagement-dashboard');
	const cloudWorkspaceHadTrial = Boolean(useSetting('Cloud_Workspace_Had_Trial'));

	const engagementDashboardRoute = useRoute('engagement-dashboard');
	const upgradeRoute = useRoute('upgrade');
	const [routeName, routeParams] = useCurrentRoute();
	const { tab } = routeParams ?? {};

	const { data } = useIsEnterprise();
	const hasEngagementDashboard = useHasLicenseModule('engagement-dashboard');
	const isUpsell = !data?.isEnterprise || !hasEngagementDashboard;

	const setModal = useSetModal();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const handleModalClose = useCallback(() => {
		setModal(null);
		setIsModalOpen(false);
	}, [setModal]);

	useEffect(() => {
		if (routeName !== 'engagement-dashboard') {
			return;
		}

		const handleConfirmModal = () => {
			handleModalClose();
			upgradeRoute.push({ type: 'go-fully-featured-registered' });
		};

		const talkToSales = 'https://go.rocket.chat/i/contact-sales';
		const handleCancelModal = () => {
			handleModalClose();
			window.open(talkToSales, '_blank');
		};

		if (isUpsell) {
			engagementDashboardRoute.replace({ context: 'upsell', tab: 'users' });
			setModal(
				<UpsellModal
					title={t('Engagement_Dashboard')}
					img='images/Engagement.svg'
					subtitle={t('Analyze_practical_usage')}
					description={t('Enrich_your_workspace')}
					confirmText={cloudWorkspaceHadTrial ? t('Learn_more') : t('Start_a_free_trial')}
					cancelText={t('Talk_to_an_expert')}
					onConfirm={handleConfirmModal}
					onCancel={handleCancelModal}
					onClose={handleModalClose}
				/>,
			);
			setIsModalOpen(true);
			return;
		}

		if (!isValidTab(tab)) {
			engagementDashboardRoute.replace({ context: 'active', tab: 'users' });
		}
	}, [routeName, engagementDashboardRoute, tab, isUpsell, setModal, handleModalClose, t, cloudWorkspaceHadTrial, upgradeRoute]);

	const eventStats = useEndpointAction('POST', '/v1/statistics.telemetry');

	if (!isValidTab(tab)) {
		return null;
	}

	if (isModalOpen) {
		return <PageSkeleton />;
	}

	if (!canViewEngagementDashboard || !hasEngagementDashboard) {
		return <NotAuthorizedPage />;
	}

	eventStats({
		params: [{ eventName: 'updateCounter', settingsId: 'Engagement_Dashboard_Load_Count' }],
	});
	return <EngagementDashboardPage tab={tab} onSelectTab={(tab): void => engagementDashboardRoute.push({ context: 'active', tab })} />;
};

export default EngagementDashboardRoute;
