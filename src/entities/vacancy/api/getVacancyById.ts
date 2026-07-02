import { apiFetch } from '@/shared/api';

import { vacanciesApiUrls } from '../model/constants/vacancy';
import { VacancyDetails } from '../model/types/vacancy';

export async function getVacancyById(id: string) {
	return apiFetch<VacancyDetails>(vacanciesApiUrls.getVacancyById(id));
}
