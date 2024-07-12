import { Sidebar } from '@rocket.chat/fuselage';
import { useSessionDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import type { HTMLAttributes } from 'react';
import React from 'react';

type LoginProps = Omit<HTMLAttributes<HTMLElement>, 'is'>;

const Login = (props: LoginProps) => {
	const setForceLogin = useSessionDispatch('forceLogin');
	const t = useTranslation();

	return (
		<Sidebar.TopBar.Action
			{...props}
			primary
			icon='login'
			title={t('Sign_in_to_start_talking')}
			onClick={(): void => setForceLogin(true)}
		/>
	);
};

export default Login;
