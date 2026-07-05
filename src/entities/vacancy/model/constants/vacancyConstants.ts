import { API_VERSION } from '@/shared/config';

export const vacanciesApiUrls = {
	getVacancies: `${API_VERSION.V1}/vacancies/public`,
	getVacancyById: (id: string) => `${API_VERSION.V1}/vacancies/public/${id}`,
};

export const MAX_SHOW_LIMIT_VACANCIES = 10;
export const MAX_SHOW_LIMIT_SKILLS = 4;
export const MAX_SHOW_LIMIT_KEYWORDS = 5;
