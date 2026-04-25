import { apiFetch } from '@/shared/api';

import { taskApiUrls } from '../model/constants/task';
import type {
	GetLanguagesResponse,
	GetTaskCategoriesResponse,
	GetTasksListParams,
	GetTasksListResponse,
} from '../model/types/task';

export async function getTasksList(params: GetTasksListParams) {
	return apiFetch<GetTasksListResponse>(taskApiUrls.getTasksList, {
		searchParams: {
			page: params.page ?? 1,
			limit: params.limit ?? 10,
			id: params.id,
			title: params.title,
			slug: params.slug,
			difficulty: params.difficulty,
			category: params.category,
			langIds: params.langIds?.join(','),
			isActive: params.isActive,
			search: params.search,
			sortBy: params.sortBy,
			sortOrder: params.sortOrder,
		},
		cacheStrategy: 'no-store',
	});
}

export async function getTaskCategories() {
	return apiFetch<GetTaskCategoriesResponse>(taskApiUrls.getTaskCategories, {
		searchParams: { isActive: true },
	});
}

export async function getLanguages() {
	return apiFetch<GetLanguagesResponse>(taskApiUrls.getLanguages, {
		cacheStrategy: 'no-store',
	});
}
