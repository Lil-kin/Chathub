import { useMutableCallback, useLocalStorage } from '@rocket.chat/fuselage-hooks';
import { useSetModal, useToastMessageDispatch, useUserId, useMethod, useTranslation } from '@rocket.chat/ui-contexts';
import React, { useState, useCallback, useMemo } from 'react';

import GenericModal from '../../../../components/GenericModal';
import ImageGallery from '../../../../components/ImageGallery/ImageGallery';
import { useRecordList } from '../../../../hooks/lists/useRecordList';
import { AsyncStatePhase } from '../../../../hooks/useAsyncState';
import { useImageGallery } from '../../../../hooks/useImageGallery';
import { useRoom } from '../../contexts/RoomContext';
import { useRoomToolbox } from '../../contexts/RoomToolboxContext';
import RoomFiles from './RoomFiles';
import { useFilesList } from './hooks/useFilesList';
import { useMessageDeletionIsAllowed } from './hooks/useMessageDeletionIsAllowed';

const RoomFilesWithData = () => {
	const uid = useUserId();
	const room = useRoom();
	const { closeTab } = useRoomToolbox();
	const t = useTranslation();
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());
	const dispatchToastMessage = useToastMessageDispatch();
	const deleteFile = useMethod('deleteFileMessage');
	const { imageUrl, onClose } = useImageGallery('rcx-avatar__element', 'rcx-verticalbar__content');

	const [type, setType] = useLocalStorage('file-list-type', 'all');
	const [text, setText] = useState('');

	const handleTextChange = useCallback((event) => {
		setText(event.currentTarget.value);
	}, []);

	const { filesList, loadMoreItems, reload } = useFilesList(useMemo(() => ({ rid: room._id, type, text }), [room._id, type, text]));
	const { phase, items: filesItems, itemCount: totalItemCount } = useRecordList(filesList);

	const handleDelete = useMutableCallback((_id) => {
		const onConfirm = async () => {
			try {
				await deleteFile(_id);
				dispatchToastMessage({ type: 'success', message: t('Deleted') });
				reload();
			} catch (error) {
				dispatchToastMessage({ type: 'error', message: error });
			}
			closeModal();
		};

		setModal(
			<GenericModal variant='danger' onConfirm={onConfirm} onCancel={closeModal} confirmText={t('Delete')}>
				{t('Delete_File_Warning')}
			</GenericModal>,
		);
	}, []);

	const isDeletionAllowed = useMessageDeletionIsAllowed(room._id, uid);

	return (
		<>
			{imageUrl && <ImageGallery url={imageUrl} onClose={onClose} />}
			<RoomFiles
				rid={room._id}
				loading={phase === AsyncStatePhase.LOADING}
				type={type}
				text={text}
				loadMoreItems={loadMoreItems}
				setType={setType}
				setText={handleTextChange}
				filesItems={filesItems}
				total={totalItemCount}
				onClickClose={closeTab}
				onClickDelete={handleDelete}
				isDeletionAllowed={isDeletionAllowed}
			/>
		</>
	);
};

export default RoomFilesWithData;
