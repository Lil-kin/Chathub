import { IRoom } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import { useTranslation, useUserId } from '@rocket.chat/ui-contexts';
import {
	VideoConfPopup,
	VideoConfPopupContent,
	VideoConfPopupControllers,
	VideoConfController,
	useVideoConfControllers,
	VideoConfButton,
	VideoConfPopupFooter,
	VideoConfPopupTitle,
	VideoConfPopupIndicators,
} from '@rocket.chat/ui-video-conf';
import React, { ReactElement } from 'react';

import ReactiveUserStatus from '../../../../../components/UserStatus/ReactiveUserStatus';
import RoomAvatar from '../../../../../components/avatar/RoomAvatar';

const ReceivingPopup = ({ room, onClose }: { room: IRoom; onClose: () => void }): ReactElement => {
	const t = useTranslation();
	const userId = useUserId();
	const directUserId = room.uids?.filter((uid) => uid !== userId).shift();
	const { controllersConfig, handleToggleMic, handleToggleVideo } = useVideoConfControllers();

	return (
		<VideoConfPopup>
			<VideoConfPopupContent>
				{/* Design Team has planned x48 */}
				<RoomAvatar room={room} size='x40' />
				<VideoConfPopupIndicators current={1} total={3} />
				<VideoConfPopupTitle text='Incoming call from' icon='phone-in' />
				{directUserId && (
					<Box display='flex' alignItems='center' mbs='x8'>
						<ReactiveUserStatus uid={directUserId} />
						<Box mis='x8' display='flex'>
							<Box>{room.name}</Box>
							<Box mis='x4' color='neutral-600'>
								(object Object)
							</Box>
						</Box>
					</Box>
				)}
				<VideoConfPopupControllers>
					<VideoConfController
						primary={controllersConfig.mic}
						text={controllersConfig.mic ? t('Mic_on') : t('Mic_off')}
						title={controllersConfig.mic ? t('Mic_on') : t('Mic_off')}
						icon={controllersConfig.mic ? 'mic' : 'mic-off'}
						onClick={handleToggleMic}
					/>
					<VideoConfController
						primary={controllersConfig.video}
						text={controllersConfig.video ? t('Cam_on') : t('Cam_off')}
						title={controllersConfig.video ? t('Cam_on') : t('Cam_off')}
						icon={controllersConfig.video ? 'video' : 'video-off'}
						onClick={handleToggleVideo}
					/>
				</VideoConfPopupControllers>
				<VideoConfPopupFooter>
					<VideoConfButton primary onClick={(): void => console.log('accept call')}>
						{t('Accept')}
					</VideoConfButton>
					<VideoConfButton danger onClick={onClose}>
						{t('Decline')}
					</VideoConfButton>
				</VideoConfPopupFooter>
			</VideoConfPopupContent>
		</VideoConfPopup>
	);
};

export default ReceivingPopup;
