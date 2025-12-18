import { apiFetch } from '@/shared/api';
import { route } from '@/shared/libs';

import { collectionApiUrls } from '../model/constants/collection';
import type {
	Collection,
	GetCollectionsListParamsRequest,
	GetCollectionsListResponse,
} from '../model/types/collection';

export async function getCollectionsList(params: GetCollectionsListParamsRequest) {
	return apiFetch<GetCollectionsListResponse>(collectionApiUrls.getCollectionsList, {
		searchParams: {
			...params,
			page: params.page ?? 1,
			limit: params.limit ?? 20,
		},
	});
}

export async function getCollectionById(id: number) {
	return apiFetch<Collection>(route(collectionApiUrls.getCollectionById, id || ''));
}
