'use client';

import { useCallback, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { TaskCategoryCode, TaskDifficulty } from '@/entities/tasks';
import { parseNumberArray, useDebounce } from '@/shared/libs';
import { TasksFilterParams } from '@/widgets/task/TasksFilterPanel';

export const useTasksFilter = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const filter: TasksFilterParams = useMemo(() => {
		const langIdsParam = searchParams?.get('langIds');

		return {
			title: searchParams?.get('title') ?? '',
			difficulty: searchParams?.get('difficulty')
				? (Number(searchParams.get('difficulty')) as TaskDifficulty)
				: undefined,
			langIds: langIdsParam ? parseNumberArray(langIdsParam) : [],
			category: (searchParams?.get('category') as TaskCategoryCode) ?? undefined,
		};
	}, [searchParams]);

	const setParam = useCallback(
		(key: string, value?: string | number | number[]) => {
			const params = new URLSearchParams(searchParams?.toString() ?? '');

			if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
				params.delete(key);
			} else {
				params.set(key, Array.isArray(value) ? value.join(',') : String(value));
			}

			if (key !== 'page') {
				params.delete('page');
			}

			const newUrl = `${pathname}?${params.toString()}`;
			router.replace(newUrl, { scroll: false });
		},
		[pathname, router, searchParams],
	);

	const onChangeSearch = useCallback((value: string) => setParam('title', value), [setParam]);
	const onChangeDifficulty = useCallback(
		(value?: TaskDifficulty) => setParam('difficulty', value),
		[setParam],
	);
	const onChangeLangIds = useCallback((ids: number[]) => setParam('langIds', ids), [setParam]);
	const onChangeCategory = useCallback(
		(value?: TaskCategoryCode) => setParam('category', value),
		[setParam],
	);
	const onChangeCompany = useCallback((value?: string) => setParam('companyId', value), [setParam]);

	const debouncedSearch = useDebounce(onChangeSearch, 500);

	return {
		filter,
		handlers: {
			onSearch: debouncedSearch,
			onChangeDifficulty,
			onChangeLangIds,
			onChangeCategory,
			onChangeCompany,
		},
	};
};
