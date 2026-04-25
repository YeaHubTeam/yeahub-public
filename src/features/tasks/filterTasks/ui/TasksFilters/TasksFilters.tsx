'use client';

import { useTranslations } from 'next-intl';

import type { TasksFilterParams } from '@/entities/task';
import { Task, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { SearchInput } from '@/shared/ui/SearchInput';

import { TaskCategoryFilter } from '../TaskCategoryFilter/TaskCategoryFilter';
import { TaskDifficultyFilter } from '../TaskDifficultyFilter/TaskDifficultyFilter';
import { TaskLanguagesFilter } from '../TaskLanguagesFilter/TaskLanguagesFilter';

interface TasksFiltersProps {
	filters: TasksFilterParams;
	categories: string[];
	languages: { id: number; name: string }[];
	onChangeTitle: (title: TasksFilterParams['title']) => void;
	onChangeDifficulty: (difficulty?: TasksFilterParams['difficulty']) => void;
	onChangeLangIds: (langIds?: TasksFilterParams['langIds']) => void;
	onChangeCategory: (category?: string) => void;
}

export const TasksFilters = ({
	filters,
	categories,
	languages,
	onChangeTitle,
	onChangeDifficulty,
	onChangeLangIds,
	onChangeCategory,
}: TasksFiltersProps) => {
	const { title, difficulty, langIds, category } = filters;
	const t = useTranslations(i18Namespace.task);

	return (
		<Flex direction="column" gap="24">
			<SearchInput
				placeholder={t(Task.SEARCH_PLACEHOLDER)}
				onSearch={onChangeTitle}
				currentValue={title}
			/>

			<TaskDifficultyFilter
				selectedDifficulty={difficulty}
				onChangeDifficulty={onChangeDifficulty}
			/>

			<TaskLanguagesFilter
				languages={languages}
				selectedLangIds={langIds}
				onChangeLangIds={onChangeLangIds}
			/>

			<TaskCategoryFilter
				categories={categories}
				selectedCategory={category}
				onChangeCategory={onChangeCategory}
			/>
		</Flex>
	);
};
