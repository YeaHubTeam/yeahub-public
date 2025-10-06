// eslint-disable-next-line @conarti/feature-sliced/layers-slices
import { Skill } from '@/entities/skill';
// eslint-disable-next-line @conarti/feature-sliced/layers-slices
import { Specialization } from '@/entities/specialization';
import { Author, Response } from '@/shared/types/types';

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
	disabled?: boolean;
}

type skillFilterMode = 'ALL' | 'ANY';

export interface GetQuestionsListParamsRequest {
	page?: number;
	limit?: number;
	title?: string;
	titleOrDescription?: string;
	skills?: number[];
	complexity?: number[];
	collection?: number;
	rate?: number[];
	keywords?: string[];
	skillFilterMode?: skillFilterMode;
	specialization?: number | number[];
	order?: string;
	orderBy?: string;
	random?: boolean;
	profileId?: string;
	areFavorites?: boolean;
}

export type GetQuestionsListResponse = Response<Question[]>;
