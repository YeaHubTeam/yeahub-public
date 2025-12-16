/* eslint-disable @conarti/feature-sliced/layers-slices */
import { GetQuestionsListResponse } from '@/entities/question/@x/collection';
import { apiFetch } from '@/shared/api';

import type {
	Collection,
	GetCollectionsListParamsRequest,
	GetCollectionsListResponse,
} from '../model/types/collection';

const COLLECTIONS_BASE = 'collections/public';
const COLLECTION_BASE = 'collections';
const COLLECTION_QUESTIONS_BASE = 'questions/public-questions';

export async function getCollectionsList(params: GetCollectionsListParamsRequest) {
	return apiFetch<GetCollectionsListResponse>(COLLECTIONS_BASE, {
		searchParams: {
			...params,
			page: params.page ?? 1,
			limit: params.limit ?? 20,
		},
	});
}

export async function getCollectionById(id: number) {
	return apiFetch<Collection>(`${COLLECTION_BASE}/${id}/public`);
}

export async function getCollectionQuestions(id: number, limit: number) {
	return apiFetch<GetQuestionsListResponse>(
		`${COLLECTION_QUESTIONS_BASE}?skillFilterMode=ANY&collection=${id}&limit=${limit}`,
	);
}
