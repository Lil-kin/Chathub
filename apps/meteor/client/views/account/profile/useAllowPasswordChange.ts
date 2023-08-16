import { useSetting, useUser } from '@rocket.chat/ui-contexts';
import { useMemo } from 'react';

export const useAllowPasswordChange = () => {
	const user = useUser();

	let allowPasswordChange = useSetting('Accounts_AllowPasswordChange');
	const allowOAuthPasswordChange = useSetting('Accounts_AllowPasswordChangeForOAuthUsers');

	const hasLocalPassword = Boolean(user?.services?.password?.exists);

	if (allowPasswordChange && !allowOAuthPasswordChange) {
		allowPasswordChange = hasLocalPassword;
	}

	return useMemo(() => ({ allowPasswordChange, hasLocalPassword }), [allowPasswordChange, hasLocalPassword]);
};
