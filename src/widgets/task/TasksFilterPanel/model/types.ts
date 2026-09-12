import { TaskCategoryCode, TaskDifficulty } from '@/entities/task';

export interface TasksFilterParams {
	page?: number;
	title?: string;
	difficulty?: TaskDifficulty;
	category?: TaskCategoryCode;
	langIds?: number[];
	companyId?: string;
}
