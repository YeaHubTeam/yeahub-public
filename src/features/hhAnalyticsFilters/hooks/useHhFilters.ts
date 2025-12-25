'use client';

import { useCallback, useMemo } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { DEFAULT_SPECIALIZATION_ID } from '@/entities/specialization';

import type { HhAnalyticsMode } from '../model/types/types';

interface UseHhFiltersOptions {
	defaultSpecialization?: number;
	defaultMode?: HhAnalyticsMode;
	defaultPage?: number;
}

interface HhFilters {
	page: number;
	mode: HhAnalyticsMode;
	specialization: number;
}

export const useHhFilters = (options: UseHhFiltersOptions = {}) => {
	const {
		defaultSpecialization = DEFAULT_SPECIALIZATION_ID,
		defaultMode = 'skills',
		defaultPage = 1,
	} = options;

	const router = useRouter();
	const searchParams = useSearchParams();

	const filters = useMemo((): HhFilters => {
		const params = Object.fromEntries(searchParams?.entries() || []);

		return {
			page: params.page ? Math.max(1, parseInt(params.page, 10)) : defaultPage,
			mode: params.mode === 'skills' || params.mode === 'keywords' ? params.mode : defaultMode,
			specialization: params.specialization
				? parseInt(params.specialization, 10)
				: defaultSpecialization,
		};
	}, [searchParams, defaultSpecialization, defaultMode, defaultPage]);

	const updateFilters = useCallback(
		(updates: Partial<HhFilters>) => {
			const params = new URLSearchParams(searchParams?.toString() || '');

			Object.entries(updates).forEach(([key, value]) => {
				if (value === undefined || value === null || value === 0) {
					params.delete(key);
				} else {
					params.set(key, String(value));
				}
			});

			router.push(`?${params.toString()}`, { scroll: false });
		},
		[router, searchParams],
	);

	const setPage = useCallback(
		(page: number) => {
			updateFilters({ page: Math.max(1, page) });
		},
		[updateFilters],
	);

	const setSpecialization = useCallback(
		(specialization: number) => {
			updateFilters({
				specialization,
				page: 1,
			});
		},
		[updateFilters],
	);

	const setMode = useCallback(
		(mode: HhAnalyticsMode) => {
			updateFilters({
				mode,
				page: 1,
			});
		},
		[updateFilters],
	);

	const resetFilters = useCallback(() => {
		updateFilters({
			page: defaultPage,
			mode: defaultMode,
			specialization: defaultSpecialization,
		});
	}, [updateFilters, defaultPage, defaultMode, defaultSpecialization]);

	return {
		filters,

		updateFilters,
		setPage,
		setSpecialization,
		setMode,
		resetFilters,

		hasFilters: (searchParams?.size || 0) > 0,
		filterCount: searchParams?.size || 0,

		queryParams: filters,
	};
};
