import { useTranslations } from 'next-intl';

import { ChooseQuestionComplexity, RateFilterSection } from '@/entities/question';
import { SkillsListField } from '@/entities/skill';
import { i18Namespace } from '@/shared/config/i18n/i18n';
import { Questions } from '@/shared/config/i18n/i18nTranslations';
import { useDebounce } from '@/shared/hooks';
import { Flex } from '@/shared/ui/Flex';
import { SearchInput } from '@/shared/ui/SearchInput';

import { FilterParams, QuestionFilterStatus } from '../model/types';
import { StatusFilterSection } from './StatusFilterSection/StatusFilterSection';

interface QuestionsFilterPanelProps {
	filter: FilterParams;
	onChangeSearch: (value: string) => void;
	onChangeSkills: (skills: number[] | undefined) => void;
	onChangeComplexity: (complexity: number[] | undefined) => void;
	onChangeRate: (rate: number[]) => void;
	onChangeStatus: (status: QuestionFilterStatus) => void;
}
export const QuestionsFilterPanel = ({
	filter,
	onChangeSearch,
	onChangeSkills,
	onChangeComplexity,
	onChangeRate,
	onChangeStatus,
}: QuestionsFilterPanelProps) => {
	const { skills, rate, complexity, status, title } = filter;
	const t = useTranslations(i18Namespace.questions);
	const profileSpecialization = 0;

	const handleSearch = (value: string) => {
		onChangeSearch(value);
	};

	const debouncedSearch = useDebounce(handleSearch, 500);

	return (
		<Flex direction="column" gap="24">
			<SearchInput
				placeholder={t(Questions.QUESTIONS_SEARCH_PLACEHOLDER)}
				onSearch={debouncedSearch}
				currentValue={title}
			/>
			<SkillsListField
				selectedSkills={skills}
				onChangeSkills={onChangeSkills}
				selectedSpecialization={profileSpecialization}
			/>
			<ChooseQuestionComplexity
				onChangeComplexity={onChangeComplexity}
				selectedComplexity={complexity}
			/>
			<RateFilterSection onChangeRate={onChangeRate} selectedRate={rate} />
			<StatusFilterSection
				onChangeStatus={onChangeStatus}
				selectedStatus={status as QuestionFilterStatus}
			/>
		</Flex>
	);
};
