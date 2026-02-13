import { Company } from '@/entities/company/@x/collection';
import { Question } from '@/entities/question/@x/collection';
import { Specialization } from '@/entities/specialization/@x/collection';
import { Author } from '@/shared/libs';
import { Response } from '@/shared/libs';

export type CollectionTariff = 'free' | 'premium';

export interface Collection {
	id: number;
	title: string;
	description: string;
	imageSrc?: string | null;
	createdAt?: string;
	updatedAt?: string;
	questionsCount?: number;
	keywords?: string[];
	questions?: Question[];
	specializations?: Specialization[];
	tariff: CollectionTariff;
	isFree?: boolean;
	company?: Company;
	companyId?: string;
	createdById?: string;
	createdBy?: Author;
	disabled?: boolean;
	slug: string;
}

export interface GetCollectionsListParamsRequest {
	page?: number;
	limit?: number;
	isFree?: boolean;
	specialization?: number;
	keywords?: string[];
	titleOrDescriptionSearch?: string;
	authorId?: string;
}

export type GetCollectionsListResponse = Response<Collection[]>;

export type GetCollectionByIdResponse = Collection;
export type GetCollectionQuestionsResponse = Response<Question[]>;

export type GetCollectionByIdParamsRequest = {
	collectionId?: string;
	limit?: number;
};

export interface GetCollectionsSlugsParamsRequest {
	page?: number;
	limit?: number;
}

export interface CollectionSlug {
	id: number;
	slug: string;
}

export type GetCollectionSlugsResponse = Response<CollectionSlug[]>;
