import { Skill } from '@/entities/skill/@x/vacancy';
import type { Response } from '@/shared/libs';

export type VacancySource = 'hh' | 'habr' | 'telegram' | 'company_site' | 'hr' | 'anonymous' | null;
export type VacancyStatus = 'active' | 'archived' | null;
export type VacancyWorkFormat = 'Office' | 'Remote' | 'Hybrid' | 'Field';
export type VacancyEmploymentForm = 'Fulltime' | 'Parttime' | 'Project' | 'Shift' | null;
export type VacancyGrade = 'Trainee' | 'Junior' | 'Middle' | 'Senior' | 'Lead' | 'Head' | null;
export type VacancyEnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
export type VacancyIndustry =
	| 'AI'
	| 'SaaS'
	| 'FinTech'
	| 'GameDev'
	| 'Ecommerce'
	| 'Robotics'
	| 'IGamming'
	| 'Retail'
	| 'MedTech'
	| 'EdTech'
	| 'HRTech'
	| 'Cybersecurity'
	| 'Logistics'
	| 'Travel'
	| 'Telecom'
	| 'Other'
	| null;
export type VacancyCompanyType = 'Product' | 'Outsource' | 'Startup' | 'Other' | null;
export type VacancySalaryCurrency = 'RUB' | 'USD' | 'EUR' | 'UZS' | 'KZT' | null;
export type VacancySkill = Pick<Skill, 'id' | 'title'>;

export interface VacancyAiProfile {
	providerCode: string;
	providerVacancyId: string;
	name: string;
	company: string;
	extra: VacancyExtra[];
	keySkills: string[] | null;
	plusSkills: string[] | null;
	tasks: string[];
	keywords: string[];
	companyType: VacancyCompanyType;
	industry: VacancyIndustry;
	grade: VacancyGrade;
	createdAt: string;
	updatedAt: string;
}
export interface VacancySalary {
	from: number | null;
	to: number | null;
	currency: VacancySalaryCurrency;
}

export interface VacancyCompany {
	id: string | null;
	title: string;
	imageSrc: string | null;
}

export interface VacancyPreparation {
	collectionsCount: number;
	questionsCount: number;
	tasksCount: number;
}

export interface VacancyExtra {
	key: string;
	value: string;
}

export interface VacancyDetails {
	id: string;
	source: VacancySource;
	sourceVacancyId: string;
	title: string;
	description: string;
	status: VacancyStatus;
	area: string;
	employmentForm: VacancyEmploymentForm;
	internship: boolean;
	grade: VacancyGrade;
	englishLevel: VacancyEnglishLevel;
	workFormat: VacancyWorkFormat[];
	industry: VacancyIndustry;
	companyType: VacancyCompanyType;
	specializationId: number;
	salary: VacancySalary;
	publishedAt: string;
	sourcePublishedAt: string;
	applyVacancyUrl: string;
	company: VacancyCompany;
	skills: VacancySkill[];
	aiProfile: VacancyAiProfile;
	preparation: VacancyPreparation;
}

export type GetVacancyDetailsResponse = Response<VacancyDetails>;
