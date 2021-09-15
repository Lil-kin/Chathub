import { Button } from '@rocket.chat/fuselage';
import React, { memo, useMemo } from 'react';

import type { ISetting } from '../../../../../definition/ISetting';
import { useEditableSettings } from '../../../../contexts/EditableSettingsContext';
import { useModal } from '../../../../contexts/ModalContext';
import { useEndpoint } from '../../../../contexts/ServerContext';
import { useSetting } from '../../../../contexts/SettingsContext';
import { useToastMessageDispatch } from '../../../../contexts/ToastMessagesContext';
import { useTranslation } from '../../../../contexts/TranslationContext';
import TabbedGroupPage from './TabbedGroupPage';

function LDAPGroupPage({ _id, ...group }: ISetting): JSX.Element {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();
	const testConnection = useEndpoint('POST', 'ldap.testConnection');
	const syncNow = useEndpoint('POST', 'ldap.syncNow');
	const ldapEnabled = useSetting('LDAP_Enable');
	const ldapSyncEnabled = useSetting('LDAP_Background_Sync') && ldapEnabled;
	const modal = useModal();

	const editableSettings = useEditableSettings(
		useMemo(
			() => ({
				group: _id,
			}),
			[_id],
		),
	);

	const changed = useMemo(
		() => editableSettings.some(({ changed }) => changed),
		[editableSettings],
	);

	const handleTestConnectionButtonClick = async (): Promise<void> => {
		try {
			const data = await testConnection();
			const args = [data.message].concat(data.params);
			dispatchToastMessage({ type: 'success', message: t(...args) });
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	};

	const handleSyncNowButtonClick = async (): Promise<void> => {
		try {
			await testConnection();
			modal.open(
				{
					title: t('Execute_Synchronization_Now'),
					text: t('LDAP_Sync_Now_Description'),
					confirmButtonText: t('Sync'),
					showCancelButton: true,
					closeOnConfirm: true,
					closeOnCancel: true,
				},
				async (isConfirm: boolean): Promise<void> => {
					if (!isConfirm) {
						return;
					}

					try {
						const data = await syncNow();
						const args = [data.message].concat(data.params);
						dispatchToastMessage({ type: 'success', message: t(...args) });
					} catch (error) {
						dispatchToastMessage({ type: 'error', message: error });
					}
				},
			);
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	};

	const handleDocumentationClick = (): void => {
		window.open('https://docs.rocket.chat/guides/administration/administration/settings/ldap');
	};

	return (
		<TabbedGroupPage
			_id={_id}
			{...group}
			headerButtons={
				<>
					<Button
						children={t('Test_Connection')}
						disabled={!ldapEnabled || changed}
						onClick={handleTestConnectionButtonClick}
					/>
					{ldapSyncEnabled && (
						<Button
							children={t('LDAP_Sync_Now')}
							disabled={!ldapSyncEnabled || changed}
							onClick={handleSyncNowButtonClick}
						/>
					)}
					<Button children={t('LDAP_Documentation')} onClick={handleDocumentationClick} />
				</>
			}
		/>
	);
}

export default memo(LDAPGroupPage);
