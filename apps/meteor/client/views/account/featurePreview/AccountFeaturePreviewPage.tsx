import { ButtonGroup, Button, Box, Field, ToggleSwitch, FieldGroup, States, StatesIcon, StatesTitle } from '@rocket.chat/fuselage';
import { useToastMessageDispatch, useTranslation, useEndpoint } from '@rocket.chat/ui-contexts';
import type { ChangeEvent } from 'react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Page from '../../../components/Page';
import { useFeaturePreview } from '../../../hooks/useFeaturePreview';

const AccountFeaturePreviewPage = () => {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();
	const { features, newFeatures } = useFeaturePreview();

	const setUserPreferences = useEndpoint('POST', '/v1/users.setPreferences');

	useEffect(() => {
		if (newFeatures) {
			const featuresPreview = features.map((feature) => ({
				name: feature.name,
				value: feature.value,
			}));

			void setUserPreferences({ data: { featuresPreview } });
		}
	}, [setUserPreferences, features, newFeatures]);

	const {
		watch,
		formState: { isDirty },
		setValue,
		handleSubmit,
		reset,
	} = useForm({
		defaultValues: { featuresPreview: features },
	});

	const { featuresPreview } = watch();

	const handleSave = async () => {
		try {
			await setUserPreferences({ data: { featuresPreview } });
			dispatchToastMessage({ type: 'success', message: t('Preferences_saved') });
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		} finally {
			reset({ featuresPreview });
		}
	};

	const handleFeatures = (e: ChangeEvent<HTMLInputElement>) => {
		const updated = featuresPreview.map((item) => (item.name === e.target.name ? { ...item, value: e.target.checked } : item));
		setValue('featuresPreview', updated, { shouldDirty: true });
	};

	return (
		<Page>
			<Page.Header title={t('Feature_preview')}>
				<ButtonGroup>
					<Button primary disabled={!isDirty} onClick={handleSubmit(handleSave)}>
						{t('Save_changes')}
					</Button>
				</ButtonGroup>
			</Page.Header>
			<Page.ScrollableContentWithShadow>
				<Box maxWidth='x600' w='full' alignSelf='center'>
					{featuresPreview.length === 0 && (
						<States>
							<StatesIcon name='magnifier' />
							<StatesTitle>{t('No_feature_to_preview')}</StatesTitle>
						</States>
					)}
					<FieldGroup>
						{featuresPreview.length > 0 &&
							featuresPreview?.map((feature) => (
								<Field key={feature.name} display='flex' flexDirection='row' justifyContent='spaceBetween' flexGrow={1}>
									<Field.Label>{t(feature.i18n)}</Field.Label>
									<Field.Row>
										<ToggleSwitch checked={feature.value} name={feature.name} onChange={handleFeatures} />
									</Field.Row>
								</Field>
							))}
					</FieldGroup>
				</Box>
			</Page.ScrollableContentWithShadow>
		</Page>
	);
};

export default AccountFeaturePreviewPage;
