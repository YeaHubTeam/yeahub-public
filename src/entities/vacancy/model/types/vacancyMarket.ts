export interface VacancyMarketTopItem {
	title: string;
	count: number;
	percent: number;
}

export interface VacancyMarketSpecialization {
	specializationId: number;
	name: string;
	vacancyCount: number;
	analyzedVacancyCount: number;
	topSkills: VacancyMarketTopItem[];
	topKeywords: VacancyMarketTopItem[];
}

export interface GetVacanciesMarketOverviewResponse {
	updatedAt: string;
	specializations: VacancyMarketSpecialization[];
}
