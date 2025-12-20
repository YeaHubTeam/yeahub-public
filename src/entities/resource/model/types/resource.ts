import type { Skill } from '@/entities/skill/@x/resource';
import type { Specialization } from '@/entities/specialization/@x/resource';
import { type Author, type Response, type SortOrder } from '@/shared/libs';

export type ResourceTypeCode =
	| 'video'
	| 'podcast'
	| 'channel'
	| 'course'
	| 'article'
	| 'book'
	| 'guide'
	| 'roadmap'
	| 'trainer'
	| 'game'
	| 'repository'
	| 'chat'
	| 'tool'
	| 'documentation';

export interface ResourceType {
	code: ResourceTypeCode;
	description: string;
}

export interface Resource {
	id: string;
	name: string;
	description: string;
	type: ResourceType;
	url: string;
	keywords: string[];
	imageSrc: string;
	specializations: Specialization[];
	skills: Skill[];
	createdBy: Author;
	createdAt: string;
	updatedAt: string;
	iconBase64?: string | null;
}

export interface GetResourcesListParamsRequest {
	types?: string[];
	specializations?: number;
	skills?: string;
	keywords?: string[];
	page?: number;
	limit?: number;
	name?: string;
	authorId?: string;
	orderBy?: string;
	order?: SortOrder;
	random?: boolean;
}

export type GetResourcesListResponse = Response<Resource[]>;
