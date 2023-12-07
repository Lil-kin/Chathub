import type { IIncomingIntegration, Serialized } from '@rocket.chat/core-typings';
import { Button, ButtonGroup, Tabs, TabsItem } from '@rocket.chat/fuselage';
import { useUniqueId } from '@rocket.chat/fuselage-hooks';
import { useSetModal, useTranslation, useRouter, useRouteParameter } from '@rocket.chat/ui-contexts';
import React, { useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import GenericModal from '../../../../components/GenericModal';
import { Page, PageHeader, PageScrollableContentWithShadow, PageFooter } from '../../../../components/Page';
import { useCreateIntegration } from '../hooks/useCreateIntegration';
import { useDeleteIntegration } from '../hooks/useDeleteIntegration';
import { useUpdateIntegration } from '../hooks/useUpdateIntegration';
import IncomingWebhookForm from './IncomingWebhookForm';

const getInitialValue = (webhookData: Serialized<IIncomingIntegration> | undefined) => ({
	enabled: webhookData?.enabled || false,
	channel: webhookData?.channel.join(', ') || '',
	username: webhookData?.username || '',
	name: webhookData?.name || '',
	alias: webhookData?.alias || '',
	avatar: webhookData?.avatar || '',
	emoji: webhookData?.emoji || '',
	scriptEnabled: webhookData?.scriptEnabled || false,
	scriptEngine: webhookData?.scriptEngine || 'isolated-vm',
	overrideDestinationChannelEnabled: webhookData?.overrideDestinationChannelEnabled || false,
	script: webhookData?.script || '',
});

const INCOMING_TYPE = 'webhook-incoming';

const EditIncomingWebhook = ({ webhookData }: { webhookData?: Serialized<IIncomingIntegration> }) => {
	const t = useTranslation();
	const router = useRouter();
	const setModal = useSetModal();
	const tab = useRouteParameter('type');

	const deleteIntegration = useDeleteIntegration(INCOMING_TYPE);
	const updateIntegration = useUpdateIntegration(INCOMING_TYPE);
	const createIntegration = useCreateIntegration(INCOMING_TYPE);

	const methods = useForm({ mode: 'onBlur', values: getInitialValue(webhookData) });

	const {
		reset,
		handleSubmit,
		formState: { isDirty },
	} = methods;

	const handleDeleteIntegration = useCallback(() => {
		const onDelete = async () => {
			if (!webhookData?._id) {
				return;
			}

			deleteIntegration.mutate({ integrationId: webhookData._id, type: INCOMING_TYPE });
		};

		setModal(
			<GenericModal variant='danger' onConfirm={onDelete} onCancel={() => setModal(null)} confirmText={t('Delete')}>
				{t('Integration_Delete_Warning')}
			</GenericModal>,
		);
	}, [webhookData?._id, deleteIntegration, setModal, t]);

	const handleSave = useCallback(
		async (formValues) => {
			if (webhookData?._id) {
				return updateIntegration.mutate({ integrationId: webhookData?._id, type: INCOMING_TYPE, ...formValues });
			}

			return createIntegration.mutate({ type: INCOMING_TYPE, ...formValues });
		},
		[webhookData?._id, updateIntegration, createIntegration],
	);

	const formId = useUniqueId();

	return (
		<Page flexDirection='column'>
			<PageHeader title={t('Integration_Incoming_WebHook')}>
				<ButtonGroup>
					<Button icon='back' onClick={() => router.navigate('/admin/integrations/webhook-incoming')}>
						{t('Back')}
					</Button>
					{webhookData?._id && (
						<Button danger onClick={handleDeleteIntegration}>
							{t('Delete')}
						</Button>
					)}
				</ButtonGroup>
			</PageHeader>
			{!webhookData?._id && (
				<Tabs>
					<TabsItem selected={tab === 'incoming'} onClick={() => router.navigate('/admin/integrations/new/incoming')}>
						{t('Incoming')}
					</TabsItem>
					<TabsItem selected={tab === 'outgoing'} onClick={() => router.navigate('/admin/integrations/new/outgoing')}>
						{t('Outgoing')}
					</TabsItem>
				</Tabs>
			)}
			<PageScrollableContentWithShadow id={formId} is='form' onSubmit={handleSubmit(handleSave)}>
				<FormProvider {...methods}>
					<IncomingWebhookForm webhookData={webhookData} />
				</FormProvider>
			</PageScrollableContentWithShadow>
			<PageFooter isDirty={isDirty}>
				<ButtonGroup>
					<Button type='reset' onClick={() => reset()}>
						{t('Cancel')}
					</Button>
					<Button form={formId} primary type='submit'>
						{t('Save')}
					</Button>
				</ButtonGroup>
			</PageFooter>
		</Page>
	);
};

export default EditIncomingWebhook;
