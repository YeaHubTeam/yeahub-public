import { Vacancies } from '@/shared/config';

type FilterItem = {
	id: number;
	title: string;
	value?: string;
};

type MultiFilterItem = {
	id: number;
	title: string;
	value: string[];
};

export const MAX_SHOW_LIMIT_INDUSTRY = 4;
export const WORKING_FORMAT: FilterItem[] = [
	{ id: 1, title: Vacancies.WORKING_FORMAT_OFFICE, value: 'Office' },
	{ id: 2, title: Vacancies.WORKING_FORMAT_REMOTE, value: 'Remote' },
	{ id: 3, title: Vacancies.WORKING_FORMAT_HYBRID, value: 'Hybrid' },
];
export const INDUSTRY: FilterItem[] = [
	{ id: 1, title: 'AI' },
	{ id: 2, title: 'SaaS' },
	{ id: 3, title: 'FinTech' },
	{ id: 4, title: 'GameDev' },
	{ id: 5, title: 'Ecommerce' },
	{ id: 6, title: 'Robotics' },
	{ id: 7, title: 'IGamming' },
	{ id: 8, title: 'Retail' },
	{ id: 9, title: 'MedTech' },
	{ id: 10, title: 'EdTech' },
	{ id: 11, title: 'HRTech' },
	{ id: 12, title: 'Cybersecurity' },
	{ id: 13, title: 'Logistics' },
	{ id: 14, title: 'Travel' },
	{ id: 15, title: 'Telecom' },
	{ id: 16, title: 'Other' },
];

export const GRADE: FilterItem[] = [
	{ id: 1, title: 'Traine' },
	{ id: 2, title: 'Junior' },
	{ id: 3, title: 'Middle' },
	{ id: 4, title: 'Senior' },
	{ id: 5, title: 'Lead' },
	{ id: 6, title: 'Head' },
];

export const COMPANY_TYPE: FilterItem[] = [
	{ id: 1, title: 'Product' },
	{ id: 2, title: 'Outsource' },
	{ id: 3, title: 'Startup' },
	{ id: 5, title: 'Other' },
];

export const EMPLOYMENT_TYPE: FilterItem[] = [
	{ id: 1, title: 'Fulltime' },
	{ id: 2, title: 'Parttime' },
	{ id: 3, title: 'Project' },
	{ id: 4, title: 'Shift' },
];

export const SALARY_BUCKET: FilterItem[] = [
	{ id: 1, title: 'до 80К', value: 'under_80' },
	{ id: 2, title: '81-150К', value: 'from_80_to_150' },
	{ id: 3, title: '151-250К', value: 'from_150_to_250' },
	{ id: 4, title: '250+К', value: 'over_250' },
];

export const ENGLISH_LEVEL: MultiFilterItem[] = [
	{ id: 1, title: 'A1-A2', value: ['A1', 'A2'] },
	{ id: 2, title: 'B1-B2', value: ['B1', 'B2'] },
	{ id: 3, title: 'C1-C2', value: ['C1', 'C2'] },
];
