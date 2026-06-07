import { apiFetch } from '@/shared/api';

import { featureFlagApiUrls } from '../model/constants/featureFlags';
import {
	FeatureFlagType,
	FeatureFlags,
	GetFeatureFlagsListParamsRequest,
	GetFeatureFlagsListResponse,
} from '../model/types/featureFlag';

export const getFeatureFlagsList = async (
	params: GetFeatureFlagsListParamsRequest = {},
): Promise<FeatureFlags> => {
	const response = await apiFetch<GetFeatureFlagsListResponse>(
		featureFlagApiUrls.getFeatureFlagsList,
		{
			cacheStrategy: 'no-store',
			searchParams: {
				page: 1,
				limit: 100,
				clientType: 'WEB',
				enabled: true,
				search: 'public.',
				...params,
			},
		},
	);

	return response.data.reduce<FeatureFlags>((acc, item) => {
		acc[item.flag as FeatureFlagType] = item.enabled;

		return acc;
	}, {});
};
