import { States, StatesIcon, StatesSubtitle, StatesTitle } from '@rocket.chat/fuselage';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { getErrorMessage } from '../../../lib/errorHandling';
import Layout from './Layout';

type ErrorPageProps = {
	error: unknown;
};

const ErrorPage = ({ error }: ErrorPageProps) => {
	const { t } = useTranslation();

	return (
		<Layout>
			<States>
				<StatesIcon name='warning' variation='danger' />
				<StatesTitle>{t('core.Error')}</StatesTitle>
				<StatesSubtitle>{getErrorMessage(error)}</StatesSubtitle>
			</States>
		</Layout>
	);
};

export default ErrorPage;
