import { useFetchData } from '@/shared/api';

import { getCompanies } from '../../api/getCompanies';
import type { GetCompaniesParamsRequest, GetCompaniesResponse } from '../../model/types/company';

export const useCompanies = (
	params: GetCompaniesParamsRequest,
	initialData?: GetCompaniesResponse | null,
) => {
	return useFetchData<GetCompaniesResponse, GetCompaniesParamsRequest>({
		fetcher: getCompanies,
		params,
		initialData: initialData ?? null,
	});
};
