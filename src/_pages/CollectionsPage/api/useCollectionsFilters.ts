'use client';

import { useCallback, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useLocale } from 'next-intl';

import type { CollectionsFilterParams } from '@/entities/collection';
import { DEFAULT_SPECIALIZATION_ID, Specialization } from '@/entities/specialization';
import { useDebounce } from '@/shared/libs';

export const useCollectionsFilters = (currentSpec: Specialization) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const locale = useLocale();

	const searchParamsString = searchParams?.toString() ?? '';
	const specializationId = currentSpec.id;

	const filter: CollectionsFilterParams = useMemo(() => {
		const params: CollectionsFilterParams = {
			titleOrDescriptionSearch: searchParams?.get('titleOrDescriptionSearch') ?? '',
			specialization: specializationId,
			companies: searchParams?.get('companies') ?? '',
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

	const onChangeCompany = useCallback(
		(company: string | undefined) => {
			if (company === undefined) {
				setParam('companies', undefined);
			} else {
				setParam('companies', company);
			}
		},
		[setParam],
	);

	const onChangeSpecialization = useCallback(
		(nextId?: number, slug?: string) => {
			if (!nextId) return;

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
			onChangeCompany,
		},
	};
};
