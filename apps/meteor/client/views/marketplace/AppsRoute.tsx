import { useRouteParameter, useRoute, useMethod } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useState, useEffect } from 'react';

import PageSkeleton from '../../components/PageSkeleton';
import AppDetailsPage from './AppDetailsPage';
import AppInstallPage from './AppInstallPage';
import AppsPage from './AppsPage/AppsPage';
import AppsProvider from './AppsProvider';

const AppsRoute = (): ReactElement => {
	const [isLoading, setLoading] = useState(true);
	const isAppsEngineEnabled = useMethod('apps/is-enabled');
	const appsWhatIsItRoute = useRoute('marketplace-disabled');
	const marketplaceRoute = useRoute('marketplace');

	const context = useRouteParameter('context');
	const id = useRouteParameter('id');
	const page = useRouteParameter('page');

	useEffect(() => {
		let mounted = true;

		const initialize = async (): Promise<void> => {
			if (!(await isAppsEngineEnabled())) {
				appsWhatIsItRoute.push();
				return;
			}

			if (!mounted) {
				return;
			}

			setLoading(false);
		};

		initialize();

		return (): void => {
			mounted = false;
		};
	}, [isAppsEngineEnabled, appsWhatIsItRoute, marketplaceRoute, context]);

	if (isLoading) {
		return <PageSkeleton />;
	}

	return (
		<AppsProvider>
			{(page === 'list' && <AppsPage />) ||
				(id && page === 'info' && <AppDetailsPage id={id} />) ||
				(page === 'install' && <AppInstallPage />)}
		</AppsProvider>
	);
};

export default AppsRoute;
