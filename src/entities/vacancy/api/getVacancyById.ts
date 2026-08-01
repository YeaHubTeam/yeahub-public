import { apiFetch } from '@/shared/api';

import { vacanciesApiUrls } from '../model/constants/vacancyConstants';
import { Vacancy } from '../model/types/vacancy';

export async function getVacancyById(id: string) {
	return apiFetch<Vacancy>(vacanciesApiUrls.getVacancyById(id));
}
