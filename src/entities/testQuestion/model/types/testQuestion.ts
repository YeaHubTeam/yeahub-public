import type { Skill } from '@/entities/skill/@x/testQuestion';
import type { Specialization } from '@/entities/specialization/@x/testQuestion';
import { type Author, type Response } from '@/shared/libs';

export type TestQuestionStatus = 'public' | 'draft';

export interface TestQuestion {
	id: number;
	title: string;
	description: string;
	imageSrc: string | null;
	keywords: string[];
	status: TestQuestionStatus;
	rate: number;
	complexity: number;
	variants: Record<string, string>;
	successVariants: string[];
	createdAt: string;
	updatedAt: string;
	createdById: string;
	updatedById: string | null;
	createdBy: Author;
	updatedBy: Author | null;
	questionSpecializations: Specialization[];
	questionSkills: Skill[];
}

type SkillFilterMode = 'ALL' | 'ANY';

type OrderBy = 'createdAt' | 'title' | 'rate' | 'complexity' | 'createdById';

type SortOrder = 'ASC' | 'DESC';

export interface GetTestQuestionsListParamsRequest {
	page?: number;
	limit?: number;
	title?: string;
	titleOrDescription?: string;
	skills?: string;
	skillFilterMode?: SkillFilterMode;
	complexity?: string;
	rate?: string;
	keywords?: string[];
	collection?: number;
	specializationId?: number;
	specializationSlug?: string;
	article?: number;
	createdAtFrom?: string;
	createdAtTo?: string;
	order?: SortOrder;
	orderBy?: OrderBy;
	random?: boolean;
}

export type GetTestQuestionsListResponse = Response<TestQuestion[]>;

export type GetTestQuestionKeywordsParamsRequest = {
	page?: number;
	limit?: number;
	title?: string;
};

export type GetTestQuestionKeywordsResponse = Response<string[]>;
