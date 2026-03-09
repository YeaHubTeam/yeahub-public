import { apiFetch } from '@/shared/api';

import { resourcesApiUrls } from '../model/constants/resource';
import type {
	GetResourcesListParamsRequest,
	GetResourcesListResponse,
} from '../model/types/resource';

export async function getResourcesList(params: GetResourcesListParamsRequest) {
	return apiFetch<GetResourcesListResponse>(resourcesApiUrls.getResourcesList, {
		searchParams: {
			page: params.page ?? 1,
			limit: params.limit ?? 10,
			...params,
		},
	});
}
