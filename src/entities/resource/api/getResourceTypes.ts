import { apiFetch } from '@/shared/api';

import { resourcesApiUrls } from '../model/constants/resource';
import type { GetResourceTypesResponse } from '../model/types/resource';

export async function getResourceTypes() {
	return apiFetch<GetResourceTypesResponse>(resourcesApiUrls.getResourceTypes);
}
