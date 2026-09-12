import { CompanyCompactList } from '@/entities/company';
import { ProgrammingLanguageList } from '@/entities/programmingLanguage';
import { Task, TaskCard } from '@/entities/tasks';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';

interface TasksListProps {
	isEmptyWithFilters: boolean;
	tasks: Task[];
}

export const TasksList = ({ isEmptyWithFilters, tasks }: TasksListProps) =>
	isEmptyWithFilters ? (
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
					languagesSlot={<ProgrammingLanguageList supportedLanguages={task.supportedLanguages} />}
					companiesSlot={<CompanyCompactList companies={task.companies} />}
				/>
			))}
		</Flex>
	);
