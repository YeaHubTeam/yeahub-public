'use client';

import { useCallback, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useLocale } from 'next-intl';

import { getChannelsForSpecialization } from '@/entities/socialMedia';
import { DEFAULT_SPECIALIZATION_ID, Specialization } from '@/entities/specialization';
import { parseNumberArray, useDebounce } from '@/shared/libs';
import type { FilterParams } from '@/widgets/question/QuestionsFilterPanel';

export const useQuestionsFilter = (currentSpecialization: Specialization) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const locale = useLocale();

	const searchParamsString = searchParams?.toString() ?? '';
	const specializationId = currentSpecialization.id;

	const filter: FilterParams = useMemo(
		() => ({
			title: searchParams?.get('titleOrDescription') ?? '',
			skills: parseNumberArray(searchParams?.get('skills') ?? ''),
			complexity: parseNumberArray(searchParams?.get('complexity') ?? ''),
			rate: parseNumberArray(searchParams?.get('rate') ?? ''),
			status: 'all',
			specialization: specializationId,
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

	const onChangeSearch = useCallback(
		(value: string) => setParam('titleOrDescription', value),
		[setParam],
	);
	const onChangeSkills = useCallback((skills?: number[]) => setParam('skills', skills), [setParam]);
	const onChangeComplexity = useCallback(
		(values?: number[]) => setParam('complexity', values),
		[setParam],
	);
	const onChangeRate = useCallback((rate: number[]) => setParam('rate', rate), [setParam]);

	const onChangeSpecialization = useCallback(
		(nextId?: number, slug?: string) => {
			if (!nextId) return;
			if (!slug) return;

			const params = new URLSearchParams(searchParamsString);
			params.delete('page');
			params.delete('skills');

			router.push(`/${locale}/questions/${slug}?${params.toString()}`, { scroll: false });
		},
		[locale, router, searchParamsString, currentSpecialization],
	);

	const debouncedSearch = useDebounce(onChangeSearch, 500);

	const selectedSpecialization = Array.isArray(filter.specialization)
		? filter.specialization[0]
		: (filter.specialization ?? DEFAULT_SPECIALIZATION_ID);

	const media = getChannelsForSpecialization(selectedSpecialization);

	return {
		filter,
		selectedSpecialization,
		media,
		handlers: {
			onSearch: debouncedSearch,
			onChangeSkills,
			onChangeComplexity,
			onChangeRate,
			onChangeSpecialization,
		},
	};
};
