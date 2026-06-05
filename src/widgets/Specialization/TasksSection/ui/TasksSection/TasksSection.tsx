import { getTasksList } from '@/entities/tasks';
import { ROUTES, Specializations } from '@/shared/config';
import { SectionWrapper } from '@/widgets/Specialization/SectionWrapper';

import { TasksList } from '../TasksList/TasksList';

interface TasksSectionProps {
	locale: string;
}

export const TasksSection = async ({ locale }: TasksSectionProps) => {
	const detailRoute = `/${locale}${ROUTES.tasks.page}`;

	const tasks = await getTasksList({
		limit: 3,
	});

	return (
		<SectionWrapper
			actionTitle={Specializations.TASKS_LINK}
			actionRoute={detailRoute}
			title={Specializations.TASKS_TITLE}
		>
			<TasksList tasks={tasks.data} />
		</SectionWrapper>
	);
};
