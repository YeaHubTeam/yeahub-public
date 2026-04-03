import { ApiRequestOptions, apiFetch } from '@/shared/api';
import { route } from '@/shared/libs';

import { taskApiUrls } from '../model/constants/task';
import {
	GetTaskCategoriesResponse,
	GetTasksListParams,
	GetTasksListResponse,
	Task,
} from '../model/types/task';

export async function getTasksList(params: GetTasksListParams) {
	const { langIds, page, ...rest } = params;

	const searchParams: ApiRequestOptions['searchParams'] = {
		...rest,
		page: page ?? 1,
	};

	if (langIds?.length) {
		searchParams.langIds = langIds.join(',');
	}

	return apiFetch<GetTasksListResponse>(taskApiUrls.getTasksList, { searchParams });
}

export async function getTaskById(id: number) {
	return apiFetch<Task>(route(taskApiUrls.getTaskById, id || ''));
}

export async function getCollectionTasks(id: number, limit: number) {
	return apiFetch<GetTasksListResponse>(
		`${taskApiUrls.getTasksList}?skillFilterMode=ANY&collection=${id}&limit=${limit}`,
	);
}

export async function getTaskCategories() {
	return apiFetch<GetTaskCategoriesResponse>(taskApiUrls.getTaskCategories);
}
