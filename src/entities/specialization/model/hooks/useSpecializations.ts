import { useFetchData } from '@/shared/api';

import { GetSpecializationsParams, getSpecializations } from '../../api/getSpecializations';
import type { GetSpecializationsListResponse } from '../../model/types/specialization';

export const useSpecializations = (
	params: GetSpecializationsParams,
	initialData?: GetSpecializationsListResponse | null,
) => {
	return useFetchData<GetSpecializationsListResponse, GetSpecializationsParams>({
		fetcher: getSpecializations,
		params,
		initialData: initialData ?? null,
	});
};
