import { type Specialization } from '@/entities/specialization';
import { getTasksList } from '@/entities/tasks';
import { ROUTES, Specializations } from '@/shared/config';
import { route } from '@/shared/libs';
import { SectionWrapper } from '@/widgets/Specialization/SectionWrapper';

import { TasksList } from '../TasksList/TasksList';

interface TasksSectionProps {
	locale: string;
	specialization: Specialization;
}

export const TasksSection = async ({ locale, specialization }: TasksSectionProps) => {
	const detailRoute = `/${locale}${route(ROUTES.tasks.page, specialization.slug)}`;

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
