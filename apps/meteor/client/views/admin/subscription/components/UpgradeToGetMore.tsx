import { Box, States, StatesIcon, StatesTitle, StatesSubtitle, Button, ButtonGroup, CardGroup } from '@rocket.chat/fuselage';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import GenericCard from '../../../../components/GenericCard';
import { useExternalLink } from '../../../../hooks/useExternalLink';
import { PRICING_LINK } from '../utils/links';

type UpgradeToGetMoreProps = {
	activeModules: string[];
	isEnterprise: boolean;
	children: React.ReactNode;
};

const enterpriseModules = [
	'scalability',
	'accessibility-certification',
	'engagement-dashboard',
	'oauth-enterprise',
	'custom-roles',
	'auditing',
];

const UpgradeToGetMore = ({ activeModules, children }: UpgradeToGetMoreProps) => {
	const { t } = useTranslation();
	const handleOpenLink = useExternalLink();

	const upgradeModules = enterpriseModules
		.filter((module) => !activeModules.includes(module))
		.map((module) => {
			return {
				title: t(`UpgradeToGetMore_${module}_Title`),
				body: t(`UpgradeToGetMore_${module}_Body`),
			};
		});

	if (upgradeModules?.length === 0) {
		return (
			<ButtonGroup large vertical>
				{children}
			</ButtonGroup>
		);
	}

	return (
		<Box w='full' p={8} mbs={40}>
			<States>
				<StatesIcon name='rocket' />
				<StatesTitle>{t('UpgradeToGetMore_Headline')}</StatesTitle>
				<StatesSubtitle>{t('UpgradeToGetMore_Subtitle')}</StatesSubtitle>
			</States>
			<CardGroup stretch wrap>
				{upgradeModules.map((card, index) => {
					return <GenericCard key={index} icon='check' type='success' {...card} />;
				})}
			</CardGroup>
			<ButtonGroup large vertical pbs={24}>
				<Button icon='new-window' onClick={() => handleOpenLink(PRICING_LINK)} role='link'>
					{t('Compare_plans')}
				</Button>
				{children}
			</ButtonGroup>
		</Box>
	);
};

export default memo(UpgradeToGetMore);
