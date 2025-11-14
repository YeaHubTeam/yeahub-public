'use client';

import { useCallback, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useLocale } from 'next-intl';

import { getChannelsForSpecialization } from '@/entities/socialMedia';
import { DEFAULT_SPECIALIZATION_ID } from '@/entities/specialization';
import { parseNumberArray, useDebounce } from '@/shared/libs';
import { SPEC_MAP } from '@/shared/libs';
import type { FilterParams } from '@/widgets/question/QuestionsFilterPanel';

const findSpecializationSlugById = (id: number) => {
	const entry = Object.entries(SPEC_MAP).find(([, value]) => value === id);
	return entry?.[0];
};

export const useQuestionsFilter = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const locale = useLocale();

	const searchParamsString = searchParams?.toString() ?? '';
	const specializationSlug =
		(pathname?.split('/')[3] as keyof typeof SPEC_MAP | undefined) ?? 'react-developer';
	const specializationId = SPEC_MAP[specializationSlug] ?? DEFAULT_SPECIALIZATION_ID;

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
		(nextId?: number) => {
			if (!nextId) return;

			const slug = findSpecializationSlugById(nextId);
			if (!slug) return;

			router.push(`/${locale}/questions/${slug}`, { scroll: false });
		},
		[locale, router],
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
