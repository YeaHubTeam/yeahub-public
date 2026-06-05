import { apiFetch } from '@/shared/api';

import { featureFlagApiUrls, isFeatureFlagType } from '../model/constants/featureFlags';
import {
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
				...params,
			},
		},
	);

	return response.data.reduce<FeatureFlags>((acc, item) => {
		if (!isFeatureFlagType(item.flag)) return acc;

		acc[item.flag] = {
			id: item.flag,
			enabled: item.enabled,
			description: item.description,
		};

		return acc;
	}, {});
};
