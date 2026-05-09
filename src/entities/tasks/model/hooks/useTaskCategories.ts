import { useFetchData } from '@/shared/api';

import { getTaskCategories } from '../../api/getTasks';
import type { GetTaskCategoriesResponse } from '../types/task';

export const useTaskCategories = (initialData?: GetTaskCategoriesResponse | null) => {
	return useFetchData<GetTaskCategoriesResponse, undefined>({
		fetcher: getTaskCategories,
		params: undefined,
		initialData: initialData ?? null,
	});
};
