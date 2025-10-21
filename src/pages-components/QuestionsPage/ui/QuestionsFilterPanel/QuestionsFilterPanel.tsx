'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useLocale, useTranslations } from 'next-intl';

import { MediaLinksBanner, getChannelsForSpecialization } from '@/entities/medias';
import { ChooseQuestionComplexity, RateFilterSection } from '@/entities/questions';
import { SkillsListField } from '@/entities/skills';
import { DEFAULT_SPECIALIZATION_ID, SpecializationsListField } from '@/entities/specializations';
import { Questions, i18Namespace } from '@/shared/config';
import { SPEC_MAP } from '@/shared/constants';
import { useDebounce } from '@/shared/hooks';
import { Flex } from '@/shared/ui/Flex';
import { SearchInput } from '@/shared/ui/SearchInput';
import type { FilterParams } from '@/widgets/question/QuestionsFilterPanel';

export const QuestionsFilterPanel = () => {
	const t = useTranslations(i18Namespace.questions);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const locale = useLocale();

	const filter: FilterParams = {
		title: searchParams.get('title') ?? '',
		skills: searchParams.get('skills')?.split(',').map(Number),
		complexity: searchParams.get('complexity')?.split(',').map(Number),
		rate: searchParams.get('rate')?.split(',').map(Number),
		status: 'all',
		specialization:
			SPEC_MAP[(pathname.split('/')[3] as keyof typeof SPEC_MAP | undefined) ?? 'react-developer'],
	};

	const setParam = (key: string, value?: string | number | number[]) => {
		const params = new URLSearchParams(searchParams);
		if (!value || (Array.isArray(value) && value.length === 0)) {
			params.delete(key);
		} else {
			params.set(key, Array.isArray(value) ? value.join(',') : value.toString());
		}
		params.delete('page');
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	const getSpecSlugById = (id: number) => Object.entries(SPEC_MAP).find(([, v]) => v === id)?.[0];

	const onChangeSearch = (value: string) => setParam('title', value);
	const onChangeSkills = (skills?: number[]) => setParam('skills', skills);
	const onChangeComplexity = (val?: number[]) => setParam('complexity', val);
	const onChangeRate = (rate: number[]) => setParam('rate', rate);
	const onChangeSpecialization = (newId?: number) => {
		if (!newId) return;

		const slug = getSpecSlugById(newId);
		if (!slug) return;

		router.push(`/${locale}/questions/${slug}`, { scroll: false });
	};

	const debouncedSearch = useDebounce(onChangeSearch, 500);

	const selectedSpecialization = Array.isArray(filter.specialization)
		? filter.specialization[0]
		: filter.specialization;

	const media = getChannelsForSpecialization(selectedSpecialization ?? DEFAULT_SPECIALIZATION_ID);

	return (
		<Flex direction="column" gap="24">
			<SearchInput
				placeholder={t(Questions.QUESTIONS_SEARCH_PLACEHOLDER)}
				onSearch={debouncedSearch}
				currentValue={filter.title}
			/>
			<SpecializationsListField
				selectedSpecialization={selectedSpecialization || DEFAULT_SPECIALIZATION_ID}
				onChangeSpecialization={onChangeSpecialization}
			/>
			<SkillsListField
				selectedSkills={filter.skills}
				onChangeSkills={onChangeSkills}
				selectedSpecialization={selectedSpecialization || DEFAULT_SPECIALIZATION_ID}
			/>
			<ChooseQuestionComplexity
				onChangeComplexity={onChangeComplexity}
				selectedComplexity={filter.complexity}
			/>
			<RateFilterSection onChangeRate={onChangeRate} selectedRate={filter.rate} />
			{media && <MediaLinksBanner mediaLink={media} />}
		</Flex>
	);
};
