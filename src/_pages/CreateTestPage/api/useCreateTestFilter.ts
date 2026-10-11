'use client';

import { useCallback, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { DEFAULT_SPECIALIZATION_ID } from '@/entities/specialization';
import { parseNumberArray } from '@/shared/libs';

import type { CreateTestFilterParams, TestSelectionMode } from '../model/types/filters';

export const useCreateTestFilter = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const searchParamsString = searchParams?.toString() ?? '';

	const filter: CreateTestFilterParams = useMemo(() => {
		const limit = Number(searchParams?.get('limit'));
		const specialization = Number(searchParams?.get('specialization'));
		const mode = searchParams?.get('mode');
		return {
			skills: parseNumberArray(searchParams?.get('skills') ?? ''),
			complexity: parseNumberArray(searchParams?.get('complexity') ?? '1,2,3'),
			limit: Number.isInteger(limit) && limit > 0 ? limit : 20,
			specialization:
				Number.isInteger(specialization) && specialization > 0
					? specialization
					: DEFAULT_SPECIALIZATION_ID,
			mode: mode === 'REPEAT' || mode === 'RANDOM' ? mode : 'NEW',
		};
	}, [searchParams]);

	const updateParams = useCallback(
		(updates: Record<string, string | number | number[] | undefined>) => {
			const params = new URLSearchParams(searchParamsString);

			Object.entries(updates).forEach(([key, value]) => {
				if (key === 'complexity' && Array.isArray(value) && value.length === 0) {
					params.set(key, '');
					return;
				}
				if (!value || (Array.isArray(value) && value.length === 0)) {
					params.delete(key);
				} else {
					params.set(key, Array.isArray(value) ? value.join(',') : value.toString());
				}
			});

			params.delete('page');
			router.replace(`${pathname}?${params.toString()}`, { scroll: false });
		},
		[pathname, router, searchParamsString],
	);

	const onChangeSkills = useCallback(
		(skills?: number[]) => updateParams({ skills }),
		[updateParams],
	);
	const onChangeComplexity = useCallback(
		(complexity?: number[]) => updateParams({ complexity: complexity ?? [] }),
		[updateParams],
	);
	const onChangeLimit = useCallback((limit?: number) => updateParams({ limit }), [updateParams]);
	const onChangeMode = useCallback(
		(mode: TestSelectionMode) => updateParams({ mode }),
		[updateParams],
	);

	return {
		filter,
		handlers: {
			onChangeSkills,
			onChangeComplexity,
			onChangeLimit,
			onChangeMode,
		},
	};
};
