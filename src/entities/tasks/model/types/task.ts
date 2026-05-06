import { ProgrammingLanguage } from '@/entities/programmingLanguage';
import { Response, SortOrder } from '@/shared/libs';

export type TaskDifficulty = 1 | 2 | 3 | 4 | 5;

export type TaskSubscriptionLevel = 'free' | 'premium';

export interface Task {
	id: string;
	name: string;
	difficulty: TaskDifficulty;
	supportedLanguages: ProgrammingLanguage[];
	mainCategory: TaskCategoryCode;
	canSolve: boolean;
}

export type TaskCategoryCode =
	| 'algorithms'
	| 'data-structures'
	| 'databases'
	| 'strings'
	| 'arrays'
	| 'dynamic-programming'
	| 'lists'
	| 'matrices'
	| 'objects'
	| 'dictionaries'
	| 'stack'
	| 'queue'
	| 'linked-lists'
	| 'trees'
	| 'graphs'
	| 'sorting'
	| 'search'
	| 'greedy'
	| 'recursion'
	| 'conditions'
	| 'loops'
	| 'functions'
	| 'iterators'
	| 'generators'
	| 'parsing'
	| 'filtering'
	| 'grouping'
	| 'aggregation'
	| 'serialization'
	| 'async'
	| 'caching'
	| 'pointers'
	| 'patterns';

export interface TaskCategory {
	id: number;
	name: string;
	code: TaskCategoryCode;
	description: string;
	parentCode: string | null;
	childrenCodes: TaskCategoryCode[];
	isActive: boolean;
}

export type GetTaskCategoriesResponse = TaskCategory[];

export interface GetTasksListParams {
	page?: number;
	limit?: number;
	id?: string;
	title?: string;
	slug?: string;
	difficulty?: TaskDifficulty;
	category?: TaskCategoryCode;
	langIds?: number[];
	isActive?: boolean;
	search?: string;
	sortBy?: 'name' | 'difficulty' | 'createdAt' | 'updatedAt';
	sortOrder?: SortOrder;
	canSolve?: boolean;
	collectionId?: number;
	companyId?: string;
}

export type GetTasksListResponse = Response<Task[]>;

export type GetTaskByIdResponse = Task;
