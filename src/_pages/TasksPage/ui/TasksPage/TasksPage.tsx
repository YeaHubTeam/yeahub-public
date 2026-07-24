import { setRequestLocale } from 'next-intl/server';

import { CompanyCompactList } from '@/entities/company';
import { ProgrammingLanguage, ProgrammingLanguageList } from '@/entities/programmingLanguage';
import { Task, TaskCard, TaskCategory } from '@/entities/tasks';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';

import { TasksFilterPanel } from '../TaskFilterPanel/TaskFilterPanel';
import { TasksPageHeader } from '../TasksPageHeader/TasksPageHeader';
import { TasksPagePagination } from '../TasksPagePagination/TasksPagePagination';
import styles from './TasksPage.module.css';

interface TasksPageProps {
	locale: string;
	tasks: Task[];
	hasFilters: boolean;
	categories: TaskCategory[];
	languages: ProgrammingLanguage[];
	page: number;
	total: number;
	limit: number;
}

export const TasksPage = ({
	locale,
	tasks,
	hasFilters,
	categories,
	languages,
	page,
	limit,
	total,
}: TasksPageProps) => {
	setRequestLocale(locale);
	const isEmptyWithFilters = tasks.length === 0 && hasFilters;

	return (
		<Flex gap="20" align="start">
			<Card withOutsideShadow className={styles.main}>
				<TasksPageHeader categories={categories} languages={languages} />
				{isEmptyWithFilters ? (
					<Stub type="filter-empty" />
				) : (
					<Flex direction="column" gap="16">
						{tasks.map((task) => (
							<TaskCard
								slug={task.slug}
								key={task.id}
								id={task.id}
								name={task.name}
								difficulty={task.difficulty}
								categories={task.categories}
								canSolve={task.canSolve}
								languagesSlot={
									<ProgrammingLanguageList supportedLanguages={task.supportedLanguages} />
								}
								companiesSlot={<CompanyCompactList companies={task.companies} />}
							/>
						))}
					</Flex>
				)}
				<TasksPagePagination total={total} limit={limit} currentPage={page} />
			</Card>
			<Card className={styles.filters}>
				<TasksFilterPanel languages={languages} categories={categories} />
			</Card>
		</Flex>
	);
};
