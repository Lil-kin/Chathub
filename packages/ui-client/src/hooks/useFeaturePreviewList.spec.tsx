import { mockAppRoot } from '@rocket.chat/mock-providers';
import { renderHook } from '@testing-library/react-hooks';

import { useFeaturePreviewList, defaultFeaturesPreview } from './useFeaturePreviewList';

it('should return the number of unseen features and Accounts_AllowFeaturePreview enabled ', () => {
	const { result } = renderHook(() => useFeaturePreviewList(), {
		wrapper: mockAppRoot().withSetting('Accounts_AllowFeaturePreview', true).build(),
	});

	expect(result.all[0]).toEqual(
		expect.objectContaining({
			featurePreviewEnabled: true,
			unseenFeatures: defaultFeaturesPreview.length,
		}),
	);
});

it('should return the number of unseen features and Accounts_AllowFeaturePreview disabled ', () => {
	const { result } = renderHook(() => useFeaturePreviewList(), {
		wrapper: mockAppRoot().withSetting('Accounts_AllowFeaturePreview', false).build(),
	});

	expect(result.all[0]).toEqual(
		expect.objectContaining({
			featurePreviewEnabled: false,
			unseenFeatures: 0,
		}),
	);
});

it('should return 0 unseen features', () => {
	const { result } = renderHook(() => useFeaturePreviewList(), {
		wrapper: mockAppRoot()
			.withSetting('Accounts_AllowFeaturePreview', true)
			.withUserPreference('featuresPreview', defaultFeaturesPreview)
			.build(),
	});

	expect(result.current).toEqual(
		expect.objectContaining({
			featurePreviewEnabled: true,
			unseenFeatures: defaultFeaturesPreview.length,
			features: defaultFeaturesPreview,
		}),
	);
});

it('should ignore removed feature previews', () => {
	const { result } = renderHook(() => useFeaturePreviewList(), {
		wrapper: mockAppRoot()
			.withSetting('Accounts_AllowFeaturePreview', true)
			.withUserPreference('featuresPreview', [
				{
					name: 'oldFeature',
					value: false,
				},
			])
			.build(),
	});

	expect(result.current).toEqual(
		expect.objectContaining({
			featurePreviewEnabled: true,
			unseenFeatures: defaultFeaturesPreview.length,
			features: defaultFeaturesPreview,
		}),
	);
});
