import { useMemo } from 'react';

import { Utilities } from '../../../../../ee/lib/misc/Utilities';
import { useAppActionButtons } from '../../../../hooks/useAppActionButtons';
import { useApplyButtonFilters } from '../../../../hooks/useApplyButtonFilters';
import { useUiKitActionManager } from '../../../../hooks/useUiKitActionManager';
import { useRoom } from '../../contexts/RoomContext';
import type { ToolboxAction } from '../../lib/Toolbox';

export const useAppsRoomActions = () => {
	const result = useAppActionButtons('roomAction');
	const actionManager = useUiKitActionManager();
	const applyButtonFilters = useApplyButtonFilters();
	const room = useRoom();

	const data = useMemo(
		() =>
			result.data
				?.filter((action) => applyButtonFilters(action))
				.map((action): [string, ToolboxAction] => [
					action.actionId,
					{
						id: action.actionId,
						icon: undefined,
						order: 300,
						title: Utilities.getI18nKeyForApp(action.labelI18n, action.appId),
						groups: ['group', 'channel', 'live', 'team', 'direct', 'direct_multiple'],
						// Filters were applied in the applyButtonFilters function
						// if the code made it this far, the button should be shown
						action: () =>
							void actionManager.triggerActionButtonAction({
								rid: room._id,
								actionId: action.actionId,
								appId: action.appId,
								payload: { context: action.context },
							}),
					},
				]) ?? [],
		[actionManager, applyButtonFilters, result.data, room._id],
	);

	return data;
};
