import { useRole, useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';

import { getURL } from '../../../../app/utils/client/getURL';
import GenericUpsellModal from '../../../components/GenericUpsellModal';
import { useUpsellActions } from '../../../components/GenericUpsellModal/hooks';
import { useExternalLink } from '../../../hooks/useExternalLink';
import { useHasLicenseModule } from '../../../hooks/useHasLicenseModule';

type AdvancedContactModalProps = {
	onCancel: () => void;
};

const AdvancedContactModal = ({ onCancel }: AdvancedContactModalProps) => {
	const t = useTranslation();
	const isAdmin = useRole('admin');
	const hasLicense = useHasLicenseModule('contact-id-verification') as boolean;
	const { shouldShowUpsell, handleManageSubscription } = useUpsellActions(hasLicense);
	const openExternalLink = useExternalLink();

	return (
		<GenericUpsellModal
			title={t('Advanced_contact_profile')}
			description={t('Advanced_contact_profile_description')}
			img={getURL('images/single-contact-id-upsell.png')}
			onClose={onCancel}
			onCancel={shouldShowUpsell ? onCancel : () => openExternalLink('https://go.rocket.chat/i/omnichannel-docs')}
			cancelText={!shouldShowUpsell ? t('Learn_more') : undefined}
			onConfirm={shouldShowUpsell ? handleManageSubscription : undefined}
			annotation={!shouldShowUpsell && !isAdmin ? t('Ask_enable_advanced_contact_profile') : undefined}
		/>
	);
};

export default AdvancedContactModal;
