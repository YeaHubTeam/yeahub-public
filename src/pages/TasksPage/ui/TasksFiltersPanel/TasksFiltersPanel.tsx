'use client';

import { TasksFilters, useTasksFilters } from '@/features/tasks/filterTasks';

interface TasksFiltersPanelProps {
	categories: string[];
	languages: { id: number; name: string }[];
}

export const TasksFiltersPanel = ({ categories, languages }: TasksFiltersPanelProps) => {
	const { filter, handlers } = useTasksFilters();

	return (
		<TasksFilters
			filters={filter}
			categories={categories}
			languages={languages}
			onChangeTitle={(title) => handlers.onChangeTitle(title ?? '')}
			onChangeDifficulty={handlers.onChangeDifficulty}
			onChangeLangIds={handlers.onChangeLangIds}
			onChangeCategory={handlers.onChangeCategory}
		/>
	);
};
