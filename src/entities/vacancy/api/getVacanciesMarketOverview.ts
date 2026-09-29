import { apiFetch } from '@/shared/api';

import { vacancyMarketApiUrls } from '../model/constants/vacancyMarketConstants';
import type { GetVacanciesMarketOverviewResponse } from '../model/types/vacancyMarket';

export function getVacanciesMarketOverview() {
	return apiFetch<GetVacanciesMarketOverviewResponse>(
		vacancyMarketApiUrls.getVacanciesMarketOverview,
	);
}
