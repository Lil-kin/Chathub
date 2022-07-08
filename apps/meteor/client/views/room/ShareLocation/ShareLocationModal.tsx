import { IMessage, IRoom } from '@rocket.chat/core-typings';
import { useEndpoint, useTranslation, useToastMessageDispatch } from '@rocket.chat/ui-contexts';
import React, { ReactElement } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import GenericModal from '../../../components/GenericModal';
import MapView from '../../location/MapView';
import { getGeolocationPermission } from './getGeolocationPermission';
import { getGeolocationPosition } from './getGeolocationPosition';

type ShareLocationModalProps = {
	rid: IRoom['_id'];
	tmid: IMessage['tmid'];
	onClose: () => void;
};

const ShareLocationModal = ({ rid, tmid, onClose }: ShareLocationModalProps): ReactElement => {
	const t = useTranslation();
	const dispatchToast = useToastMessageDispatch();
	const { data: permissionData, isLoading: permissionLoading } = useQuery('geolocationPermission', getGeolocationPermission);
	const { data: positionData } = useQuery(['geolocationPosition', permissionData], async () => {
		if (permissionLoading || permissionData === 'prompt' || permissionData === 'denied') {
			return;
		}
		return getGeolocationPosition();
	});

	const queryClient = useQueryClient();

	const sendMessage = useEndpoint('POST', '/v1/chat.sendMessage');

	const onConfirm = (): void => {
		if (!positionData) {
			throw new Error('Failed to load position');
		}
		try {
			sendMessage({
				message: {
					rid,
					tmid,
					location: {
						type: 'Point',
						coordinates: [positionData.coords.longitude, positionData.coords.latitude],
					},
				},
			});
		} catch (error: any) {
			dispatchToast({ type: 'error', message: error });
		} finally {
			onClose();
		}
	};

	const onConfirmRequestLocation = async (): Promise<void> => {
		let position: Awaited<ReturnType<typeof getGeolocationPosition>>;
		try {
			position = await getGeolocationPosition();
			queryClient.setQueryData(['geolocationPosition', 'granted'], position);
			queryClient.setQueryData('geolocationPermission', 'granted');
		} catch (e: any) {
			queryClient.setQueryData('geolocationPermission', () => getGeolocationPermission);
		}
	};

	if (permissionLoading || permissionData === 'prompt') {
		return (
			<GenericModal
				title={t('You_will_be_asked_for_permissions')}
				confirmText={t('Continue')}
				onConfirm={onConfirmRequestLocation}
				onClose={onClose}
				onCancel={onClose}
			/>
		);
	}

	if (permissionData === 'denied' || !positionData) {
		return (
			<GenericModal title={t('Cannot_share_your_location')} confirmText={t('Ok')} onConfirm={onClose} onClose={onClose}>
				{t('The_necessary_browser_permissions_for_location_sharing_are_not_granted')}
			</GenericModal>
		);
	}

	return (
		<GenericModal title={t('Share_Location_Title')} onConfirm={onConfirm} onClose={onClose}>
			<MapView latitude={positionData.coords.latitude} longitude={positionData.coords.longitude} />
		</GenericModal>
	);
};

export default ShareLocationModal;
