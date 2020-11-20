
import { useDebouncedValue, useMediaQuery, useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { useMemo, useCallback, useState } from 'react';
import { Box, Table, Icon, Button } from '@rocket.chat/fuselage';

import GenericTable from '../../components/GenericTable';
import { useTranslation } from '../../contexts/TranslationContext';
import { useEndpointDataExperimental } from '../../hooks/useEndpointDataExperimental';
import { useEndpointAction } from '../../hooks/useEndpointAction';
import { usePermission } from '../../contexts/AuthorizationContext';
import NotAuthorizedPage from '../../components/NotAuthorizedPage';
import ManagersPage from './ManagersPage';
import UserAvatar from '../../components/basic/avatar/UserAvatar';
import { useSetModal } from '../../contexts/ModalContext';
import { useToastMessageDispatch } from '../../contexts/ToastMessagesContext';
import DeleteWarningModal from '../../components/DeleteWarningModal';

export function RemoveManagerButton({ _id, reload }) {
	const t = useTranslation();
	const deleteAction = useEndpointAction('DELETE', `livechat/users/manager/${ _id }`);
	const setModal = useSetModal();
	const dispatchToastMessage = useToastMessageDispatch();

	const handleRemoveClick = useMutableCallback(async () => {
		const result = await deleteAction();
		if (result.success === true) {
			reload();
		}
	});
	const handleDelete = useMutableCallback((e) => {
		e.stopPropagation();
		const onDeleteManager = async () => {
			try {
				await handleRemoveClick();
				dispatchToastMessage({ type: 'success', message: t('Manager_removed') });
			} catch (error) {
				dispatchToastMessage({ type: 'error', message: error });
			}
			setModal();
		};

		setModal(<DeleteWarningModal
			onDelete={onDeleteManager}
			onCancel={() => setModal()}
		/>);
	});

	return <Table.Cell fontScale='p1' color='hint' withTruncatedText>
		<Button small ghost title={t('Remove')} onClick={handleDelete}>
			<Icon name='trash' size='x16'/>
		</Button>
	</Table.Cell>;
}

const sortDir = (sortDir) => (sortDir === 'asc' ? 1 : -1);


const useQuery = ({ text, itemsPerPage, current }, [column, direction]) => useMemo(() => ({
	fields: JSON.stringify({ name: 1, username: 1, emails: 1, avatarETag: 1 }),
	text,
	sort: JSON.stringify({ [column]: sortDir(direction), usernames: column === 'name' ? sortDir(direction) : undefined }),
	...itemsPerPage && { count: itemsPerPage },
	...current && { offset: current },
}), [text, itemsPerPage, current, column, direction]);

export function ManagersRoute() {
	const t = useTranslation();
	const canViewManagers = usePermission('manage-livechat-managers');

	const [params, setParams] = useState({ text: '', current: 0, itemsPerPage: 25 });
	const [sort, setSort] = useState(['name', 'asc']);

	const mediaQuery = useMediaQuery('(min-width: 1024px)');

	const onHeaderClick = useMutableCallback((id) => {
		const [sortBy, sortDirection] = sort;

		if (sortBy === id) {
			setSort([id, sortDirection === 'asc' ? 'desc' : 'asc']);
			return;
		}
		setSort([id, 'asc']);
	});


	const debouncedParams = useDebouncedValue(params, 500);
	const debouncedSort = useDebouncedValue(sort, 500);
	const query = useQuery(debouncedParams, debouncedSort);

	const { data, reload } = useEndpointDataExperimental('livechat/users/manager', query) || {};


	const header = useMemo(() => [
		<GenericTable.HeaderCell key={'name'} direction={sort[1]} active={sort[0] === 'name'} onClick={onHeaderClick} sort='name'>{t('Name')}</GenericTable.HeaderCell>,
		mediaQuery && <GenericTable.HeaderCell key={'username'} direction={sort[1]} active={sort[0] === 'username'} onClick={onHeaderClick} sort='username'>{t('Username')}</GenericTable.HeaderCell>,
		<GenericTable.HeaderCell key={'email'} direction={sort[1]} active={sort[0] === 'emails.address'} onClick={onHeaderClick} sort='emails.address' >{t('Email')}</GenericTable.HeaderCell>,
		<GenericTable.HeaderCell key={'remove'} w='x60'>{t('Remove')}</GenericTable.HeaderCell>,
	].filter(Boolean), [sort, onHeaderClick, t, mediaQuery]);

	const renderRow = useCallback(({ emails, _id, username, name, avatarETag }) => <Table.Row key={_id} tabIndex={0} qa-user-id={_id}>
		<Table.Cell withTruncatedText>
			<Box display='flex' alignItems='center'>
				<UserAvatar size={mediaQuery ? 'x28' : 'x40'} title={username} username={username} etag={avatarETag}/>
				<Box display='flex' withTruncatedText mi='x8'>
					<Box display='flex' flexDirection='column' alignSelf='center' withTruncatedText>
						<Box fontScale='p2' withTruncatedText color='default'>{name || username}</Box>
						{!mediaQuery && name && <Box fontScale='p1' color='hint' withTruncatedText> {`@${ username }`} </Box>}
					</Box>
				</Box>
			</Box>
		</Table.Cell>
		{mediaQuery && <Table.Cell>
			<Box fontScale='p2' withTruncatedText color='hint'>{ username }</Box> <Box mi='x4'/>
		</Table.Cell>}
		<Table.Cell withTruncatedText>{emails && emails.length && emails[0].address}</Table.Cell>
		<RemoveManagerButton _id={_id} reload={reload}/>
	</Table.Row>, [mediaQuery, reload]);

	if (!canViewManagers) {
		return <NotAuthorizedPage />;
	}

	return <ManagersPage setParams={setParams} params={params} onHeaderClick={onHeaderClick} data={data} useQuery={useQuery} reload={reload} header={header} renderRow={renderRow} title={t('Managers')} />;
}

export default ManagersRoute;
