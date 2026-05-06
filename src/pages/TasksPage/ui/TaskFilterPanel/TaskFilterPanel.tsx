'use client';

import { useTranslations } from 'next-intl';

import { LanguagesFilterSection, ProgrammingLanguage } from '@/entities/programmingLanguage';
import { CategoriesFilterSection, DifficultFilterSection, TaskCategory } from '@/entities/tasks';
import { Tasks, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { SearchInput } from '@/shared/ui/SearchInput';

import { useTasksFilter } from '../../model/api/useTasksFilter';

interface TasksFilterPanelProps {
	categories: TaskCategory[];
	languages: ProgrammingLanguage[];
}

export const TasksFilterPanel = ({ categories, languages }: TasksFilterPanelProps) => {
	const t = useTranslations(i18Namespace.tasks);
	const { filter, handlers } = useTasksFilter();

	return (
		<Flex direction="column" gap="24">
			<SearchInput
				placeholder={t(Tasks.SEARCH_PLACEHOLDER)}
				onSearch={handlers.onSearch}
				currentValue={filter.title}
			/>
			<DifficultFilterSection
				selectedDifficulty={filter.difficulty}
				onChangeDifficulty={handlers.onChangeDifficulty}
			/>
			<LanguagesFilterSection
				selectedLangIds={filter.langIds || []}
				onChangeLangIds={handlers.onChangeLangIds}
				initialData={languages}
			/>
			<CategoriesFilterSection
				selectedCategory={filter.category}
				onChangeCategory={handlers.onChangeCategory}
				initialData={categories}
			/>
		</Flex>
	);
};
