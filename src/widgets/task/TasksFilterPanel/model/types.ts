import { TaskCategoryCode, TaskDifficulty } from '@/entities/tasks';

export interface TasksFilterParams {
	page?: number;
	title?: string;
	difficulty?: TaskDifficulty;
	category?: TaskCategoryCode;
	langIds?: number[];
	companyId?: string;
}
