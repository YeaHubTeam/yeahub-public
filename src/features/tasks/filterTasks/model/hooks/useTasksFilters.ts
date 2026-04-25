'use client';

import { useCallback, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { GetTasksListParams, TaskDifficulty, TasksFilterParams } from '@/entities/task';
import { useDebounce } from '@/shared/libs';

export const useTasksFilters = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const safePathname = usePathname() ?? '';

	const searchParamsString = searchParams?.toString() ?? '';

	const filter: TasksFilterParams = useMemo(
		() => ({
			page: Number(searchParams?.get('page')) || 1,
			title: searchParams?.get('title')?.toString() ?? '',
			difficulty: (searchParams?.get('difficulty')
				? Number(searchParams.get('difficulty'))
				: undefined) as TaskDifficulty,
			langIds: searchParams?.get('langIds')
				? searchParams.get('langIds')!.split(',').map(Number)
				: undefined,
			category: searchParams?.get('category') || undefined,
		}),
		[searchParams],
	);

	const setParam = useCallback(
		(key: string, value?: string | number | number[]) => {
			const params = new URLSearchParams(searchParamsString);

			if (!value && value !== 0) {
				params.delete(key);
			} else {
				params.set(key, Array.isArray(value) ? value.join(',') : value.toString());
			}

			if (key !== 'page') {
				params.delete('page');
			}

			const query = params.toString();
			router.replace(query ? `${safePathname}?${query}` : safePathname, { scroll: false });
		},
		[safePathname, router, searchParamsString],
	);

	const onChangePage = useCallback((page: number) => setParam('page', page), [setParam]);

	const onChangeTitle = useCallback((value: string) => setParam('title', value), [setParam]);

	const onChangeDifficulty = useCallback(
		(value?: TaskDifficulty) => setParam('difficulty', value),
		[setParam],
	);

	const onChangeLangIds = useCallback(
		(values?: number[]) => setParam('langIds', values),
		[setParam],
	);

	const onChangeCategory = useCallback((value?: string) => setParam('category', value), [setParam]);

	const onResetFilters = useCallback(() => {
		const params = new URLSearchParams(searchParamsString);

		params.delete('title');
		params.delete('difficulty');
		params.delete('langIds');
		params.delete('category');
		params.delete('page');

		const query = params.toString();
		router.replace(query ? `${safePathname}?${query}` : safePathname, { scroll: false });
	}, [safePathname, router, searchParamsString]);

	const debouncedTitle = useDebounce(onChangeTitle, 500);

	const queryParams: GetTasksListParams = useMemo(
		() => ({
			page: filter.page,
			title: filter.title || undefined,
			difficulty: filter.difficulty,
			langIds: filter.langIds,
			category: filter.category,
		}),
		[filter],
	);

	const hasFilters =
		!!filter.title || !!filter.difficulty || (filter.langIds?.length ?? 0) > 0 || !!filter.category;

	return {
		filter,
		queryParams,
		hasFilters,
		handlers: {
			onChangePage,
			onChangeTitle: debouncedTitle,
			onChangeDifficulty,
			onChangeLangIds,
			onChangeCategory,
			onResetFilters,
		},
	};
};
