import { Vacancies } from '@/shared/config';

import { VacancyTag } from '../types/types';

export const tagList: VacancyTag[] = [
	{
		id: 'area',
		icon: 'compass',
		category: Vacancies.TAGS_AREA,
	},
	{
		id: 'grade',
		icon: 'bar',
		category: Vacancies.TAGS_GRADE,
	},
	{
		id: 'employmentForm',
		icon: 'clock',
		category: Vacancies.TAGS_EMPLOYMENT,
	},
	{
		id: 'industry',
		icon: 'globe',
		category: Vacancies.TAGS_INDUSTRY,
	},
	{
		id: 'companyType',
		icon: 'packageBox',
		category: Vacancies.TAGS_COMPANY_TYPE,
	},
];
