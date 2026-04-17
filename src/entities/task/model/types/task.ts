import { Response, SortOrder } from '@/shared/libs';

export type TaskDifficulty = 1 | 2 | 3 | 4 | 5;

export interface TaskListItem {
	id: string;
	name: string;
	slug: string;
	difficulty: TaskDifficulty;
	supportedLanguages: { id: number; name: string }[];
	mainCategory: string;
	categoryId?: number;
}

export interface TaskCategory {
	id: number;
	name: string;
}

export interface TasksFilterParams {
	page?: number;
	title?: string;
	difficulty?: TaskDifficulty;
	langIds?: number[];
	category?: string;
}

export interface GetTasksListParams {
	page?: number;
	limit?: number;
	id?: string;
	title?: string;
	slug?: string;
	difficulty?: TaskDifficulty;
	category?: string;
	langIds?: number[];
	isActive?: boolean;
	search?: string;
	sortBy?: 'name' | 'difficulty' | 'createdAt' | 'updatedAt';
	sortOrder?: SortOrder;
}

export type GetTasksListResponse = Response<TaskListItem[]>;

export type GetTaskCategoriesResponse = TaskCategory[];

export interface ProgrammingLanguage {
	id: number;
	name: string;
}

export type GetLanguagesResponse = ProgrammingLanguage[];
