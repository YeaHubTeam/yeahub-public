'use client';

import { useCallback, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useLocale } from 'next-intl';

import type { ResourceTypeCode } from '@/entities/resource';
import { DEFAULT_SPECIALIZATION_ID, Specialization } from '@/entities/specialization';
import { parseNumberArray, parseStringArray, useDebounce } from '@/shared/libs';

import type { ResourcesFilterParams } from '../types/types';

export const useResourcesFilter = (currentSpec: Specialization) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const locale = useLocale();

	const searchParamsString = searchParams?.toString() ?? '';
	const specializationId = currentSpec.id;

	const filter: ResourcesFilterParams = useMemo(
		() => ({
			name: searchParams?.get('name') ?? '',
			specialization: specializationId,
			skills: parseNumberArray(searchParams?.get('skills') ?? ''),
			types: parseStringArray(searchParams?.get('types') ?? '') as unknown as ResourceTypeCode[],
		}),
		[searchParams, specializationId],
	);

	const setParam = useCallback(
		(key: string, value?: string | number | number[]) => {
			const params = new URLSearchParams(searchParamsString);

			if (!value || (Array.isArray(value) && value.length === 0)) {
				params.delete(key);
			} else {
				params.set(key, Array.isArray(value) ? value.join(',') : value.toString());
			}

			params.delete('page');

			router.replace(`${pathname}?${params.toString()}`, { scroll: false });
		},
		[pathname, router, searchParamsString],
	);

	const onChangeSearch = useCallback((value: string) => setParam('name', value), [setParam]);
	const onChangeSkills = useCallback((skills?: number[]) => setParam('skills', skills), [setParam]);

	const onChangeTypes = useCallback(
		(types?: ResourceTypeCode[]) => setParam('types', types?.join(',')),
		[setParam],
	);

	const onChangeSpecialization = useCallback(
		(nextId?: number, slug?: string) => {
			if (!nextId) return;

			if (!slug) return;

			router.push(`/${locale}/resources/${slug}`, { scroll: false });
		},
		[locale, router],
	);

	const debouncedSearch = useDebounce(onChangeSearch, 500);

	const selectedSpecialization = Array.isArray(filter.specialization)
		? filter.specialization[0]
		: (filter.specialization ?? DEFAULT_SPECIALIZATION_ID);

	return {
		filter,
		selectedSpecialization,
		handlers: {
			onSearch: debouncedSearch,
			onChangeSkills,
			onChangeSpecialization,
			onChangeTypes,
		},
	};
};
