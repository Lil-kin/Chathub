import { IUIKitContextualBarInteraction } from '@rocket.chat/apps-engine/definition/uikit';
import { useEffect, useState } from 'react';

import { Apps } from '../../../../app/apps/client/orchestrator';
import { getUserInteractionPayloadByViewId } from '../../../../app/ui-message/client/ActionManager';
import { useCurrentRoute } from '../../../contexts/RouterContext';
import { App } from '../../admin/apps/types';

type AppsContextualBarData = {
	viewId: string;
	payload: IUIKitContextualBarInteraction;
	appInfo: App;
};

export const useAppsContextualBar = (): AppsContextualBarData | undefined => {
	const [, params] = useCurrentRoute();
	const [payload, setPayload] = useState<IUIKitContextualBarInteraction>();
	const [appInfo, setAppInfo] = useState<App>();

	const viewId = params?.context;

	useEffect(() => {
		async function getAppData(appId: string): Promise<void> {
			const app = await Apps.getApp(appId);
			setAppInfo(app);
		}

		if (viewId) {
			setPayload(getUserInteractionPayloadByViewId(viewId) as IUIKitContextualBarInteraction);
		}

		if (payload?.appId) {
			getAppData(payload.appId);
		}
	}, [viewId, payload]);

	if (viewId && payload && appInfo) {
		return {
			viewId,
			payload,
			appInfo,
		};
	}

	return undefined;
};
