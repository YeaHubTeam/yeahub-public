import type { Skill } from '@/entities/skill/@x/article';
import type { Specialization } from '@/entities/specialization/@x/article';
import type { Author, Response } from '@/shared/libs';

export type ArticleTopics = 'interview' | 'system_design' | 'basics' | 'advanced';
export type ArticleContentType = 'theory' | 'practice' | 'interview' | 'roadmap' | 'case_study';
export type ArticleFormat = 'guide' | 'breakdown' | 'qa' | 'interview_prep';
export type ArticleOrigin = 'editorial' | 'community';
export type ArticleModerationStatus =
	| 'draft'
	| 'submitted'
	| 'approved'
	| 'rejected'
	| 'returned_for_revision';
export type ArticleSort = 'new' | 'updated';

export interface Article {
	id: number;
	title: string;
	slug: string;
	excerpt: string;
	imageSrc: string | null;
	readingTimeMinutes: number;
	publishedAt: string;
	updatedAt: string;
	createdBy: Author;
	origin: ArticleOrigin;
	topics: ArticleTopics[];
	contentType: ArticleContentType;
	format: ArticleFormat;
	articleSpecializations: Specialization[];
	articleSkills: Skill[];
}

export interface GetPublicArticlesParamsRequest {
	page?: number;
	limit?: number;
}

export type GetPublicArticlesResponse = Response<Article[]>;
