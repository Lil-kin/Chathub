import { useLanguage } from '@rocket.chat/ui-contexts';
import { useCallback } from 'react';

export const useFormatNumber = (options?: Intl.NumberFormatOptions) => {
	const language = useLanguage();
	return useCallback(
		(value: number) => {
			return new Intl.NumberFormat(language, options).format(value);
		},
		[language, options],
	);
};
