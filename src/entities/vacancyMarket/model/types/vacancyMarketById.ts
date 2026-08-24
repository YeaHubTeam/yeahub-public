import { VacancyMarketSpecialization, VacancyMarketTopItem } from './vacancyMarket';

export interface VacancyMarketMatchedSkill extends VacancyMarketTopItem {
	skillId: number;
}

export interface VacancyMarketSpecializationById extends VacancyMarketSpecialization {
	industry: string;
	updatedAt: string;
	availableIndustries: string[];
	skillsVacancyCount: number;
	topMatchedSkills: VacancyMarketMatchedSkill[];
	topTasks: VacancyMarketTopItem[];
	priority: VacancyMarketTopItem[];
}
