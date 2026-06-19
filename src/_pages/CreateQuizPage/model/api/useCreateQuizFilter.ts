'use client';

import { useCallback, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { CreateQuizFilterParams } from '@/entities/quiz';
import { DEFAULT_SPECIALIZATION_ID } from '@/entities/specialization';
import { parseNumberArray } from '@/shared/libs';

export const useCreateQuizFilter = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const searchParamsString = searchParams?.toString() ?? '';

	const filter: CreateQuizFilterParams = useMemo(
		() => ({
			skills: parseNumberArray(searchParams?.get('skills') ?? ''),
			complexity: parseNumberArray(searchParams?.get('complexity') ?? ''),
			limit: Number(searchParams?.get('limit')) || 1,
			specialization: searchParams?.get('specialization')
				? Number(searchParams.get('specialization'))
				: DEFAULT_SPECIALIZATION_ID,
		}),
		[searchParams],
	);

	const updateParams = useCallback(
		(updates: Record<string, string | number | number[] | undefined>) => {
			const params = new URLSearchParams(searchParamsString);

			Object.entries(updates).forEach(([key, value]) => {
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
		(values?: number[]) => updateParams({ complexity: values }),
		[updateParams],
	);
	const onChangeLimit = useCallback((limit?: number) => updateParams({ limit }), [updateParams]);

	const onChangeSpecialization = useCallback(
		(specialization?: number) => {
			updateParams({
				specialization,
				skills: undefined,
			});
		},
		[updateParams],
	);

	const selectedSpecialization = Array.isArray(filter.specialization)
		? filter.specialization[0]
		: (filter.specialization ?? DEFAULT_SPECIALIZATION_ID);

	return {
		filter,
		selectedSpecialization,
		handlers: {
			onChangeSkills,
			onChangeComplexity,
			onChangeLimit,
			onChangeSpecialization,
		},
	};
};
