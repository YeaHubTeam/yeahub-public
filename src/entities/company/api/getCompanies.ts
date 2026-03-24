import { companyApiUrls } from '@/entities/company/model/constants/company';
import { apiFetch } from '@/shared/api';

import { GetCompaniesParamsRequest, GetCompaniesResponse } from '../model/types/company';

export async function getCompanies(params: GetCompaniesParamsRequest) {
	return apiFetch<GetCompaniesResponse>(companyApiUrls.getCompanies, {
		searchParams: {
			...params,
			page: params.page ?? 1,
			limit: params.limit ?? 20,
		},
	});
}
