import type { Response } from '@/shared/libs';

export interface TestQuestion {
	id: number;
	title: string;
	description: string;
	imageSrc?: string | null;
	keywords?: string[] | null;
	status: 'public' | 'draft';
	rate?: number | null;
	complexity: number | null;
	variants: Record<string, string>;
	successVariants?: string[] | null;
	createdAt: string;
	updatedAt: string;
	questionSkills: {
		id: number;
		title: string;
		imageSrc?: string | null;
	}[];
	questionSpecializations: {
		id: number;
		title: string;
		slug?: string;
	}[];
}

export interface GetTestQuestionsListParams {
	page?: number;
	limit?: number;
}

export type GetTestQuestionsListResponse = Response<TestQuestion[]>;
