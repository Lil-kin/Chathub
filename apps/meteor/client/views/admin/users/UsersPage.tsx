import type { SelectOption } from '@rocket.chat/fuselage';
import { Button, ButtonGroup } from '@rocket.chat/fuselage';
import { useEndpoint, usePermission, useRoute, useRouteParameter, useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';

import UserPageHeaderContentWithSeatsCap from '../../../../ee/client/views/admin/users/UserPageHeaderContentWithSeatsCap';
import { useSeatsCap } from '../../../../ee/client/views/admin/users/useSeatsCap';
import { Contextualbar, ContextualbarHeader, ContextualbarTitle, ContextualbarClose } from '../../../components/Contextualbar';
import Page from '../../../components/Page';
import AddUser from './AddUser';
import AdminUserInfoWithData from './AdminUserInfoWithData';
import EditUserWithData from './EditUserWithData';
import InviteUsers from './InviteUsers';
import UsersTable from './UsersTable';

const UsersPage = (): ReactElement => {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();
	const context = useRouteParameter('context');
	const id = useRouteParameter('id');
	const seatsCap = useSeatsCap();
	const reload = useRef(() => null);
	const usersRoute = useRoute('admin-users');

	const canCreateUser = usePermission('create-user');
	const canBulkCreateUser = usePermission('bulk-register-user');

	useEffect(() => {
		if (!context || !seatsCap) {
			return;
		}

		if (seatsCap.activeUsers >= seatsCap.maxActiveUsers && !['edit', 'info'].includes(context)) {
			usersRoute.push({});
		}
	}, [context, seatsCap, usersRoute]);

	const handleCloseContextualbar = (): void => {
		usersRoute.push({});
	};

	const handleNewUser = (): void => {
		usersRoute.push({ context: 'new' });
	};

	const handleInviteUser = (): void => {
		usersRoute.push({ context: 'invite' });
	};

	const handleReload = (): void => {
		seatsCap?.reload();
		reload.current();
	};

	const getRoles = useEndpoint('GET', '/v1/roles.list');
	const {
		data: roleData,
		isLoading: roleState,
		error: roleError,
	} = useQuery(
		['roles'],
		async () => {
			const roles = await getRoles();
			return roles;
		},
		{
			onError: (error) => {
				dispatchToastMessage({ type: 'error', message: error });
			},
		},
	);

	const availableRoles: SelectOption[] | undefined = roleData?.roles.map(
		({ _id, name, description }: { _id: string; name: string; description: string }) => [_id, description || name],
	);

	return (
		<Page flexDirection='row'>
			<Page>
				<Page.Header title={t('Users')}>
					{seatsCap && seatsCap.maxActiveUsers < Number.POSITIVE_INFINITY ? (
						<UserPageHeaderContentWithSeatsCap {...seatsCap} />
					) : (
						<ButtonGroup>
							{canCreateUser && (
								<Button icon='user-plus' onClick={handleNewUser}>
									{t('New')}
								</Button>
							)}
							{canBulkCreateUser && (
								<Button icon='mail' onClick={handleInviteUser}>
									{t('Invite')}
								</Button>
							)}
						</ButtonGroup>
					)}
				</Page.Header>
				<Page.Content>
					<UsersTable reload={reload} />
				</Page.Content>
			</Page>
			{context && (
				<Contextualbar>
					<ContextualbarHeader>
						<ContextualbarTitle>
							{context === 'info' && t('User_Info')}
							{context === 'edit' && t('Edit_User')}
							{context === 'new' && t('Add_User')}
							{context === 'invite' && t('Invite_Users')}
						</ContextualbarTitle>
						<ContextualbarClose onClick={handleCloseContextualbar} />
					</ContextualbarHeader>
					{context === 'info' && id && <AdminUserInfoWithData uid={id} onReload={handleReload} />}
					{context === 'edit' && id && (
						<EditUserWithData
							userId={id}
							onReload={handleReload}
							roleData={roleData || {}}
							roleState={roleState}
							roleError={roleError}
							availableRoles={availableRoles || []}
						/>
					)}
					{context === 'new' && <AddUser onReload={handleReload} availableRoles={availableRoles} />}
					{context === 'invite' && <InviteUsers />}
				</Contextualbar>
			)}
		</Page>
	);
};

export default UsersPage;
