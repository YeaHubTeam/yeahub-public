'use client';

import { useCallback, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useLocale } from 'next-intl';

import type { CreateQuizFilterParams } from '@/entities/quiz';
import { DEFAULT_SPECIALIZATION_ID } from '@/entities/specialization';
import { parseNumberArray } from '@/shared/libs';
import { SPEC_MAP } from '@/shared/libs';

const findSpecializationSlugById = (id: number) => {
	const entry = Object.entries(SPEC_MAP).find(([, value]) => value === id);
	return entry?.[0];
};

export const useCreateQuizFilter = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const locale = useLocale();

	const searchParamsString = searchParams?.toString() ?? '';
	const specializationSlug =
		(pathname?.split('/')[3] as keyof typeof SPEC_MAP | undefined) ?? 'react-developer';
	const specializationId = SPEC_MAP[specializationSlug] ?? DEFAULT_SPECIALIZATION_ID;

	const filter: CreateQuizFilterParams = useMemo(
		() => ({
			skills: parseNumberArray(searchParams?.get('skills') ?? ''),
			complexity: parseNumberArray(searchParams?.get('complexity') ?? ''),
			limit: Number(searchParams?.get('limit')) || 1,
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

	const onChangeSkills = useCallback((skills?: number[]) => setParam('skills', skills), [setParam]);
	const onChangeComplexity = useCallback(
		(values?: number[]) => setParam('complexity', values),
		[setParam],
	);
	const onChangeLimit = useCallback((limit?: number) => setParam('limit', limit), [setParam]);

	const onChangeSpecialization = useCallback(
		(nextId?: number) => {
			if (!nextId) return;

			const slug = findSpecializationSlugById(nextId);
			if (!slug) return;

			router.push(`/${locale}/quiz/${slug}`, { scroll: false });
		},
		[locale, router],
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
