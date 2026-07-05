import type { Skill } from '@/entities/skill/@x/vacancy';
import type { Specialization } from '@/entities/specialization';
import type { Response } from '@/shared/libs';

export type VacancySource = 'hh' | 'habr' | 'telegram' | 'company_site' | 'hr' | 'anonymous' | null;
export type VacancyEmploymentForm = 'Fulltime' | 'Parttime' | 'Project' | 'Shift' | null;
export type VacancyGrade = 'Trainee' | 'Junior' | 'Middle' | 'Senior' | 'Lead' | 'Head' | null;
export type VacancyEnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
export type VacancyWorkFormat = 'Office' | 'Remote' | 'Hybrid' | 'Field' | null
export type VacancySkill = Pick<Skill, 'id' | 'title'>;
export type VacancySpecialization = Pick<Specialization, 'id' | 'title'>;
export type VacancyStatus = 'active' | 'archived' | null;
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

export interface Vacancy {
  id: string;
	source: VacancySource;
	title: string;
	area: string;
	publishedAt: string;
	employmentForm: VacancyEmploymentForm;
	internship: boolean;
	grade: VacancyGrade;
	englishLevel: VacancyEnglishLevel;
	workFormat: VacancyWorkFormat[];
	company: VacancyCompany;
	salary: VacancySalary;
	specialization: VacancySpecialization;
	skills: VacancySkill[];
	preparation: VacancyPreparation;
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

export interface GetVacanciesListParamsRequest {
	page?: number;
	limit?: number;
}

export type GetVacanciesListResponse = Response<Vacancy[]>;
export type GetVacancyDetailsResponse = Response<VacancyDetails>;
