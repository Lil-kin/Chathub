import { mockAppRoot } from '@rocket.chat/mock-providers/src';
import { renderHook } from '@testing-library/react-hooks';

import { useFeaturePreview } from './useFeaturePreview';

it('should return false if featurePreviewEnabled is false', () => {
	const { result } = renderHook(() => useFeaturePreview('quickReactions'), {
		wrapper: mockAppRoot().withSetting('Accounts_AllowFeaturePreview', false).build(),
	});

	expect(result.all[0]).toBe(false);
});

// TODO: fix this test
it('should return false if featurePreviewEnabled is true but feature is not in userPreferences', () => {
	const { result } = renderHook(() => useFeaturePreview('quickReactions'), {
		wrapper: mockAppRoot()
			.withSetting('Accounts_AllowFeaturePreview', false)
			.withUserPreference('featuresPreview', [{ name: 'quickReactions', value: true }])
			.build(),
	});

	expect(result.all[0]).toBe(false);
});

it('should return true if featurePreviewEnabled is true and feature is in userPreferences', () => {
	const { result } = renderHook(() => useFeaturePreview('quickReactions'), {
		wrapper: mockAppRoot()
			.withSetting('Accounts_AllowFeaturePreview', true)
			.withUserPreference('featuresPreview', [{ name: 'quickReactions', value: true }])
			.build(),
	});

	expect(result.all[0]).toBe(true);
});
