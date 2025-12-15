import { apiFetch } from '@/shared/api';

import type {
	Collection,
	GetCollectionsListParamsRequest,
	GetCollectionsListResponse,
} from '../model/types/collection';

const COLLECTIONS_BASE = 'collections/public';
const COLLECTION_BASE = 'collections';

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
