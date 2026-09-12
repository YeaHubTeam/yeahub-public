'use client';

import { useCallback, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useLocale } from 'next-intl';

import { DEFAULT_SPECIALIZATION_ID, Specialization } from '@/entities/specialization';
import { parseNumberArray, parseStringArray, useDebounce } from '@/shared/libs';

interface FilterParams {
	search?: string;
	workFormat?: string[];
	specialization?: number | number[];
	skills?: number[];
	industry?: string[];
	grade?: string[];
	companyType?: string[];
	employmentType?: string[];
	salaryBucket?: string[];
	englishLevel?: string[];
}

export const useVacanciesFiter = (currentSpecialization: Specialization) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const locale = useLocale();

	const searchParamsString = searchParams?.toString() ?? '';
	const specializationId = currentSpecialization.id;

	const filter: FilterParams = useMemo(
		() => ({
			search: searchParams?.get('search') ?? '',
			workFormat: parseStringArray(searchParams?.get('workFormat') ?? ''),
			specialization: specializationId,
			skills: parseNumberArray(searchParams?.get('skills') ?? ''),
			industry: parseStringArray(searchParams?.get('industry') ?? ''),
			grade: parseStringArray(searchParams?.get('grade') ?? ''),
			companyType: parseStringArray(searchParams?.get('companyType') ?? ''),
			employmentType: parseStringArray(searchParams?.get('employmentType') ?? ''),
			salaryBucket: parseStringArray(searchParams?.get('salaryBucket') ?? ''),
			englishLevel: parseStringArray(searchParams?.get('englishLevel') ?? ''),
		}),
		[searchParams, specializationId],
	);

	const setParam = useCallback(
		(key: string, value?: string | string[] | number | number[]) => {
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
	const onChangeSearch = useCallback((value: string) => setParam('search', value), [setParam]);

	const onChangeWorkFormat = useCallback(
		(values: string[]) => setParam('workFormat', values),
		[setParam],
	);

	const onChangeSpecialization = useCallback(
		(nextId?: number, slug?: string) => {
			if (!nextId) return;
			if (!slug) return;

			const params = new URLSearchParams(searchParamsString);
			params.delete('page');
			params.delete('skills');

			router.push(`/${locale}/vacancies/${slug}?${params.toString()}`, { scroll: false });
		},
		[locale, router, searchParamsString],
	);

	const onChangeSkills = useCallback((skills?: number[]) => setParam('skills', skills), [setParam]);

	const onChangeIndustry = useCallback(
		(industry?: string[]) => setParam('industry', industry),
		[setParam],
	);

	const onChangeGrade = useCallback((grade?: string[]) => setParam('grade', grade), [setParam]);

	const onChangeCompanyType = useCallback(
		(type?: string[]) => setParam('companyType', type),
		[setParam],
	);

	const onChangeEmploymentType = useCallback(
		(salary?: string[]) => setParam('employmentType', salary),
		[setParam],
	);

	const onChangeSalaryBucket = useCallback(
		(salary?: string[]) => setParam('salaryBucket', salary),
		[setParam],
	);

	const onChangeEnglishLevel = useCallback(
		(level?: string[]) => setParam('englishLevel', level),
		[setParam],
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
			onChangeWorkFormat,
			onChangeSpecialization,
			onChangeSkills,
			onChangeIndustry,
			onChangeGrade,
			onChangeCompanyType,
			onChangeEmploymentType,
			onChangeSalaryBucket,
			onChangeEnglishLevel,
		},
	};
};
