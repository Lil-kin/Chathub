import React from 'react';
import { Margins, Callout, FieldGroup, Box, Button } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';

import TriggersForm from './TriggersForm';
import PageSkeleton from '../../components/PageSkeleton';
import { useTranslation } from '../../contexts/TranslationContext';
import { useMethod } from '../../contexts/ServerContext';
import { useForm } from '../../hooks/useForm';
import { useEndpointDataExperimental, ENDPOINT_STATES } from '../../hooks/useEndpointDataExperimental';
import { useRoute } from '../../contexts/RouterContext';
import { useToastMessageDispatch } from '../../contexts/ToastMessagesContext';

const EditTriggerPageContainer = ({ id, onSave }) => {
	const t = useTranslation();
	const { data, state } = useEndpointDataExperimental(`livechat/triggers/${ id }`);

	if (state === ENDPOINT_STATES.LOADING) {
		return <PageSkeleton />;
	}

	if (state === ENDPOINT_STATES.ERROR || !data?.trigger) {
		return <Callout>
			{t('Error')}: error
		</Callout>;
	}

	return <EditTriggerPage data={data.trigger} onSave={onSave}/>;
};

const getInitialValues = ({
	name,
	description,
	enabled,
	runOnce,
	registeredOnly,
	conditions: [{
		name: condName,
		value: condValue,
	}],
	actions: [{
		name: actName,
		params: {
			sender: actSender,
			msg: actMsg,
			name: actSenderName,
			department: actDept,
		},
	}],
}) => ({
	name: name ?? '',
	description: description ?? '',
	enabled: !!enabled,
	runOnce: !!runOnce,
	registeredOnly: !!registeredOnly,
	conditions: {
		name: condName ?? 'page-url',
		value: condValue ?? '',
	},
	actions: {
		name: actName ?? 'send-message',
		params: {
			sender: actSender ?? 'queue',
			msg: actMsg ?? '',
			name: actSenderName ?? '',
			department: actDept ?? '',
		},
	},
});

const EditTriggerPage = ({ data, onSave }) => {
	const dispatchToastMessage = useToastMessageDispatch();
	const t = useTranslation();

	const router = useRoute('omnichannel-triggers');

	const save = useMethod('livechat:saveTrigger');

	const { values, handlers, hasUnsavedChanges } = useForm(getInitialValues(data));

	const handleSave = useMutableCallback(async () => {
		try {
			const { actions: { name: actionName, params: { sender, msg, name, department } }, ...restValues } = values;
			await save({
				_id: data._id,
				...restValues,
				conditions: [values.conditions],
				actions: [{
					name: actionName,
					params: {
						sender,
						msg,
						department,
						...sender === 'custom' && { name },
					},
				}],
			});
			dispatchToastMessage({ type: 'success', message: t('Saved') });
			onSave();
			router.push({});
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	});

	const { name } = values;

	const canSave = name && hasUnsavedChanges;

	return 	<>
		<FieldGroup>
			<TriggersForm values={values} handlers={handlers}/>
		</FieldGroup>
		<Box display='flex' flexDirection='row' justifyContent='space-between' w='full'>
			<Margins inlineEnd='x4'>
				<Button flexGrow={1} primary onClick={handleSave} disabled={!canSave}>
					{t('Save')}
				</Button>
			</Margins>
		</Box>
	</>;
};

export default EditTriggerPageContainer;
