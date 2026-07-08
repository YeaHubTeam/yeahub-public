import { apiFetch } from '@/shared/api';

import { vacanciesApiUrls } from '../model/constants/vacancyConstants';
import type {
	GetVacanciesListParamsRequest,
	GetVacanciesListResponse,
} from '../model/types/vacancy';

export function getVacancies(params: GetVacanciesListParamsRequest) {
	return apiFetch<GetVacanciesListResponse>(vacanciesApiUrls.getVacancies, {
		searchParams: {
			page: params.page ?? 1,
			limit: params.limit ?? 10,
			...params,
		},
	});
}
