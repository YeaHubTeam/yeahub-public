'use client';

import { useCallback, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useLocale } from 'next-intl';

import type { CollectionsFilterParams } from '@/entities/collection';
import { DEFAULT_SPECIALIZATION_ID } from '@/entities/specialization';
import { useDebounce } from '@/shared/libs';
import { SPEC_MAP } from '@/shared/libs';

const findSpecializationSlugById = (id: number) => {
	const entry = Object.entries(SPEC_MAP).find(([, value]) => value === id);
	return entry?.[0];
};

export const useCollectionsFilters = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const locale = useLocale();

	const searchParamsString = searchParams?.toString() ?? '';
	const specializationSlug =
		(pathname?.split('/')[3] as keyof typeof SPEC_MAP | undefined) ?? 'react-developer';
	const specializationId = SPEC_MAP[specializationSlug] ?? DEFAULT_SPECIALIZATION_ID;

	const filter: CollectionsFilterParams = useMemo(() => {
		const params: CollectionsFilterParams = {
			titleOrDescriptionSearch: searchParams?.get('titleOrDescriptionSearch') ?? '',
			specialization: specializationId,
			page: Number(searchParams?.get('page') ?? 1),
		};

		if (searchParams?.get('isFree') != undefined) {
			params.isFree = searchParams?.get('isFree') === 'true';
		} else {
			delete params.isFree;
		}

		return params;
	}, [searchParams, specializationId]);

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

	const onChangeSearch = useCallback(
		(value: string) => setParam('titleOrDescriptionSearch', value),
		[setParam],
	);
	const onChangeIsFree = useCallback(
		(isFree: boolean | undefined) => {
			if (isFree === undefined) {
				setParam('isFree', undefined);
			} else {
				setParam('isFree', isFree.toString());
			}
		},
		[setParam],
	);

	const onChangeSpecialization = useCallback(
		(nextId?: number) => {
			if (!nextId) return;

			const slug = findSpecializationSlugById(nextId);
			if (!slug) return;

			router.push(`/${locale}/collections/${slug}`, { scroll: false });
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
			onChangeIsFree,
			onChangeSpecialization,
		},
	};
};
