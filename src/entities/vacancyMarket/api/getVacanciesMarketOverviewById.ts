import { apiFetch } from '@/shared/api';

import { vacancyMarketApiUrls } from '../model/constants/vacancyMarketConstants';
import { VacancyMarketSpecializationById } from '../model/types/vacancyMarketById';

export function getVacanciesMarketOverviewById(id: string) {
	return apiFetch<VacancyMarketSpecializationById>(vacancyMarketApiUrls.getVacanciesMarketById(id));
}
