import { API_VERSION } from '@/shared/config';

export const vacanciesApiUrls = {
	getVacancyById: (id: string) => `${API_VERSION.V1}/vacancies/public/${id}`,
};

export const MAX_SHOW_LIMIT_KEYWORDS = 5;
