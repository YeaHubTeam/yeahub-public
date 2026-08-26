import { useTranslations } from 'next-intl';

import { ProgrammingLanguage } from '@/entities/programmingLanguage';
import { Task, TaskCategory } from '@/entities/tasks';
import { Tasks, i18Namespace } from '@/shared/config';
import { ListPageWrapper } from '@/widgets/ListPageWrapper';
import { TasksList } from '@/widgets/task/TasksList';

import { TasksFilterPanel } from '../TaskFilterPanel/TaskFilterPanel';

interface TasksPageProps {
	locale: string;
	tasks: Task[];
	hasFilters: boolean;
	categories: TaskCategory[];
	languages: ProgrammingLanguage[];
}

export const TasksPage = ({ locale, tasks, hasFilters, categories, languages }: TasksPageProps) => {
	const t = useTranslations(i18Namespace.tasks);

	const isEmptyWithFilters = tasks.length === 0 && hasFilters;

	return (
		<ListPageWrapper
			locale={locale}
			title={t(Tasks.TITLE_SHORT)}
			itemsList={<TasksList isEmptyWithFilters={isEmptyWithFilters} tasks={tasks} />}
			filterPanel={<TasksFilterPanel languages={languages} categories={categories} />}
		/>
	);
};
