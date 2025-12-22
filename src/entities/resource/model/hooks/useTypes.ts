import { useFetchData } from '@/shared/api';

import { getResourceTypes } from '../../api/getResourceTypes';
import type { GetResourceTypesResponse } from '../types/resource';

export const useTypes = () => {
	return useFetchData<GetResourceTypesResponse, void>({
		fetcher: getResourceTypes,
		params: undefined,
		initialData: null,
	});
};
