import { setRequestLocale } from 'next-intl/server';

import type { TaskListItem } from '@/entities/task';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';

import { TasksFiltersPanel } from '../TasksFiltersPanel/TasksFiltersPanel';
import { TasksPageHeader } from '../TasksPageHeader/TasksPageHeader';
import { TasksPagePagination } from '../TasksPagePagination/TasksPagePagination';
import { TasksTable } from '../TasksTable/TasksTable';
import styles from './TasksPage.module.css';

interface Language {
	id: number;
	name: string;
}

interface TasksPageProps {
	locale: string;
	tasks: TaskListItem[];
	page: number;
	total: number;
	limit: number;
	hasFilters: boolean;
	categories: string[];
	languages: Language[];
}

export const TasksPage = ({
	locale,
	tasks,
	page,
	total,
	limit,
	hasFilters,
	categories,
	languages,
}: TasksPageProps) => {
	setRequestLocale(locale);

	return (
		<Flex gap="20" align="start">
			<Card className={styles.main}>
				<TasksPageHeader categories={categories} languages={languages} hasFilters={hasFilters} />
				<TasksTable tasks={tasks} />
				<TasksPagePagination total={total} limit={limit} currentPage={page} />
			</Card>
			<Card className={styles.filters}>
				<TasksFiltersPanel categories={categories} languages={languages} />
			</Card>
		</Flex>
	);
};
