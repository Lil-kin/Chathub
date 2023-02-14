import { Box, Button, Icon, Tag } from '@rocket.chat/fuselage';
import { Card } from '@rocket.chat/ui-client';
import { useRole, useSettingSetValue, useSetting, useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import { useIsEnterprise } from '../../../hooks/useIsEnterprise';
import CustomHomepageContent from '../CustomHomePageContent';

const CustomContentCard = (): ReactElement | null => {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const { data } = useIsEnterprise();
	const isAdmin = useRole('admin');
	const customContentBody = String(useSetting('Layout_Home_Body'));
	const isCustomContentBodyEmpty = customContentBody === '';
	const isCustomContentVisible = Boolean(useSetting('Layout_Home_Custom_Block_Visible'));
	const isCustomContentOnly = Boolean(useSetting('Layout_Custom_Body_Only'));

	const setCustomContentVisible = useSettingSetValue('Layout_Home_Custom_Block_Visible');
	const setCustomContentOnly = useSettingSetValue('Layout_Custom_Body_Only');

	const handleChangeCustomContentVisibility = async () => {
		try {
			await setCustomContentVisible(!isCustomContentVisible);
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	};

	const handleOnlyShowCustomContent = async () => {
		try {
			await setCustomContentOnly(!isCustomContentOnly);
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	};

	const isEnterprise = data?.isEnterprise;
	const willNotShowCustomContent = isCustomContentBodyEmpty || !isCustomContentVisible;

	if (isAdmin) {
		return (
			<Card data-qa-id='homepage-custom-card'>
				<Card.Title>
					<Tag role='status' aria-label={willNotShowCustomContent ? t('Not_Visible_To_Workspace') : t('Visible_To_Workspace')}>
						<Icon mie='x4' name={willNotShowCustomContent ? 'eye-off' : 'eye'} size='x16' />
						{willNotShowCustomContent ? t('Not_Visible_To_Workspace') : t('Visible_To_Workspace')}
					</Tag>
				</Card.Title>
				<Box
					mb='x8'
					role='status'
					color='info'
					aria-label={isCustomContentBodyEmpty ? t('Homepage_Custom_Content_Default_Message') : customContentBody}
				>
					{isCustomContentBodyEmpty ? t('Homepage_Custom_Content_Default_Message') : <CustomHomepageContent />}
				</Box>
				<Card.FooterWrapper>
					<Card.Footer>
						<Button role='link' is='a' href='/admin/settings/Layout' title={t('Layout_Home_Page_Content')}>
							{t('Customize_Content')}
						</Button>
						<Button
							disabled={isCustomContentBodyEmpty || (isCustomContentVisible && isCustomContentOnly)}
							title={!isCustomContentVisible ? t('Now_Its_Available_Only_For_Admins') : t('Now_Its_Available_For_Everyone')}
							onClick={handleChangeCustomContentVisibility}
							role='button'
						>
							<Icon mie='x4' name={willNotShowCustomContent ? 'eye' : 'eye-off'} size='x16' />
							{willNotShowCustomContent ? t('Show_To_Workspace') : t('Hide_On_Workspace')}
						</Button>
						<Button
							disabled={willNotShowCustomContent || !isEnterprise}
							title={t('It_Will_Hide_All_Other_White_Blocks_In_The_Homepage')}
							onClick={handleOnlyShowCustomContent}
							role='button'
						>
							<Icon name='lightning' size='x16' /> {!isCustomContentOnly ? t('Show_Only_This_Content') : t('Show_default_content')}
						</Button>
					</Card.Footer>
				</Card.FooterWrapper>
			</Card>
		);
	}

	if (!willNotShowCustomContent && !isCustomContentOnly) {
		return (
			<Card>
				<Box role='status' aria-label={customContentBody} mb='x8' color='info'>
					<CustomHomepageContent />
				</Box>
			</Card>
		);
	}
	return <CustomHomepageContent />;
};

export default CustomContentCard;
