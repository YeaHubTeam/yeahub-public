// eslint-disable-next-line @conarti/feature-sliced/layers-slices
import { Skill } from '@/entities/skill/@x/question';
// eslint-disable-next-line @conarti/feature-sliced/layers-slices
import { Specialization } from '@/entities/specialization/@x/question';
import { type Author, type Response } from '@/shared/libs';

export type QuestionStatus = 'public' | 'draft';

export interface Question {
	id: number;
	title: string;
	description: string;
	code?: string | null;
	imageSrc?: string | null;
	keywords: string[];
	longAnswer: string;
	shortAnswer: string;
	status: QuestionStatus;
	rate: number;
	complexity: number;
	createdAt: string;
	updatedAt: string;
	createdBy: Author;
	updatedBy: Author | null;
	questionSpecializations: Specialization[];
	questionSkills: Skill[];
	slug: string;
	disabled?: boolean;
}

type skillFilterMode = 'ALL' | 'ANY';

export interface GetQuestionsListParamsRequest {
	page?: number;
	limit?: number;
	title?: string;
	titleOrDescription?: string;
	skills?: string;
	complexity?: string;
	collection?: number;
	rate?: string;
	keywords?: string[];
	skillFilterMode?: skillFilterMode;
	specializationId?: number;
	order?: string;
	orderBy?: string;
	random?: boolean;
	profileId?: string;
	areFavorites?: boolean;
}

export type GetQuestionsListResponse = Response<Question[]>;

export interface GetQuestionsSlugsParamsRequest {
	page?: number;
	limit?: number;
	specializationSlug?: string;
}

export interface QuestionSlug {
	id: number;
	slug: string;
}

export type GetQuestionSlugsResponse = Response<QuestionSlug[]>;

export type SkillQuestion = {
	skill: string;
	count: number;
};

export interface GetQuestionsBySpecializationCountResponse {
	total: number;
	skillsQuestions: SkillQuestion[];
}
