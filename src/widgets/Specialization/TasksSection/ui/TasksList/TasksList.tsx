import { useTranslations } from 'next-intl';

import { CompanyCompactList } from '@/entities/company';
import { ProgrammingLanguageList } from '@/entities/programmingLanguage';
import { Task, TaskCard } from '@/entities/tasks';
import { Tasks, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';

interface TasksListProps {
	tasks: Task[];
}

export const TasksList = ({ tasks }: TasksListProps) => {
	const t = useTranslations(i18Namespace.tasks);

	if (tasks.length === 0) {
		return (
			<Stub
				type="empty"
				title={t(Tasks.STUB_EMPTY_TASKS_PUBLIC_TITLE)}
				subtitle={t(Tasks.STUB_EMPTY_TASKS_PUBLIC_SUBTITLE)}
			/>
		);
	}

	return (
		<Flex direction="column" gap="20">
			{tasks.map((task) => (
				<TaskCard
					key={task.id}
					languagesSlot={<ProgrammingLanguageList supportedLanguages={task.supportedLanguages} />}
					companiesSlot={<CompanyCompactList companies={task.companies} />}
					{...task}
				/>
			))}
		</Flex>
	);
};
