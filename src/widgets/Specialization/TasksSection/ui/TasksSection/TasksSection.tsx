import { getTranslations } from 'next-intl/server';

import { getTasksList } from '@/entities/tasks';
import { ROUTES, Specializations, i18Namespace } from '@/shared/config';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';

import { TasksList } from '../TasksList/TasksList';

interface TasksSectionProps {
	locale: string;
}

export const TasksSection = async ({ locale }: TasksSectionProps) => {
	const t = await getTranslations(i18Namespace.specialization);

	const detailRoute = `/${locale}${ROUTES.tasks.page}`;

	const tasks = await getTasksList({
		limit: 3,
	});

	return (
		<SectionWrapper
			actionTitle={t(Specializations.TASKS_LINK)}
			actionRoute={detailRoute}
			title={t(Specializations.TASKS_TITLE)}
		>
			<TasksList tasks={tasks.data} />
		</SectionWrapper>
	);
};
