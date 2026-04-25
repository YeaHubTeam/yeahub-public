import { setRequestLocale } from 'next-intl/server';

import { ProgrammingLanguageList } from '@/entities/programmingLanguage';
import { GetTaskCategoriesResponse, Task, TaskCard } from '@/entities/tasks';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';

import { TasksFilterPanel } from '../TaskFilterPanel/TaskFilterPanel';
import { TasksPageHeader } from '../TasksPageHeader/TasksPageHeader';
import styles from './TasksPage.module.css';

interface TasksPageProps {
	locale: string;
	tasks: Task[];
	hasFilters: boolean;
	initialCategories?: GetTaskCategoriesResponse;
}

export const TasksPage = ({ locale, tasks, hasFilters }: TasksPageProps) => {
	setRequestLocale(locale);
	const isEmptyWithFilters = tasks.length === 0 && hasFilters;

	return (
		<Flex gap="20" align="start">
			<Card className={styles.main}>
				<TasksPageHeader />
				{isEmptyWithFilters ? (
					<Stub type="filter-empty" />
				) : (
					<Flex direction="column" gap="16">
						{tasks.map((task) => (
							<TaskCard
								key={task.id}
								id={task.id}
								name={task.name}
								difficulty={task.difficulty}
								mainCategory={task.mainCategory}
								canSolve={task.canSolve}
								languagesSlot={
									<ProgrammingLanguageList supportedLanguages={task.supportedLanguages} />
								}
							/>
						))}
					</Flex>
				)}
			</Card>
			<Card className={styles.filters}>
				<TasksFilterPanel />
			</Card>
		</Flex>
	);
};
