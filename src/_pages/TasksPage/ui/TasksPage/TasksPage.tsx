import { setRequestLocale } from 'next-intl/server';

import { CompanyCompactList } from '@/entities/company';
import { ProgrammingLanguage, ProgrammingLanguageList } from '@/entities/programmingLanguage';
import { Task, TaskCard, TaskCategory } from '@/entities/tasks';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';
import { ListPageWrapper } from '@/widgets/ListPageWrapper';

import { TasksFilterPanel } from '../TaskFilterPanel/TaskFilterPanel';

interface TasksPageProps {
	locale: string;
	tasks: Task[];
	title: string;
	hasFilters: boolean;
	categories: TaskCategory[];
	languages: ProgrammingLanguage[];
	total: number;
	limit: number;
	page: number;
}

export const TasksPage = ({
	locale,
	tasks,
	hasFilters,
	categories,
	languages,
	title,
	total,
	limit,
	page,
}: TasksPageProps) => {
	setRequestLocale(locale);
	const isEmptyWithFilters = tasks.length === 0 && hasFilters;

	return (
		<ListPageWrapper
			page={page}
			total={total}
			limit={limit}
			title={title}
			filters={<TasksFilterPanel languages={languages} categories={categories} />}
		>
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
							mainCategory={task.mainCategory}
							canSolve={task.canSolve}
							languagesSlot={
								<ProgrammingLanguageList supportedLanguages={task.supportedLanguages} />
							}
							companiesSlot={<CompanyCompactList companies={task.companies} />}
						/>
					))}
				</Flex>
			)}
		</ListPageWrapper>
	);
};
