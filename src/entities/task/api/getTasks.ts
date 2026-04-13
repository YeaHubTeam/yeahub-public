import { apiFetch } from '@/shared/api';
import { route } from '@/shared/libs';

import { taskApiUrls } from '../model/constants/task';
import type {
	ExecuteCodeRequest,
	ExecuteCodeResponse,
	GetTaskByIdResponse,
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

export async function getTaskById(taskId: string) {
	return apiFetch<GetTaskByIdResponse>(route(taskApiUrls.getTaskById, taskId), {
		cacheStrategy: 'no-store',
	});
}

export async function executeCode(request: ExecuteCodeRequest) {
	return apiFetch<ExecuteCodeResponse>(taskApiUrls.executeCode, {
		method: 'POST',
		body: JSON.stringify(request),
	});
}

export async function testCode(request: ExecuteCodeRequest) {
	return apiFetch<ExecuteCodeResponse>(taskApiUrls.testCode, {
		method: 'POST',
		body: JSON.stringify(request),
	});
}

export async function getTaskCategories() {
	return apiFetch<GetTaskCategoriesResponse>(taskApiUrls.getTaskCategories, {
		searchParams: { isActive: true },
	});
}
