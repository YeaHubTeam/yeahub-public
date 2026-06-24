import type { Response } from '@/shared/libs';

interface Skill {
	id: number;
	title: string;
}

export interface Vacancy {
	id: string;
	source: string;
	title: string;
	area: string;
	publishedAt: string;
	employmentForm: string;
	internship: boolean;
	grade: string;
	englishLevel: string | null;
	workFormat: string[];
	company: {
		id: string | null;
		title: string;
		imageSrc: string | null;
	};
	salary: {
		from: number | null;
		to: number | null;
		currency: string | null;
	};
	specialization: {
		id: number;
		title: string;
	};
	skills: Skill[];
	preparation: {
		collectionsCount: number;
		questionsCount: number;
		tasksCount: number;
	};
}

export interface GetVacanciesListParamsRequest {
	page?: number;
	limit?: number;
}

export type GetVacanciesListResponse = Response<Vacancy[]>;
