import { getTranslations } from 'next-intl/server';

import { getTasksList } from '@/entities/task';
import { ROUTES, Specializations, i18Namespace } from '@/shared/config';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';

import { TasksList } from '../TasksList/TasksList';

interface TasksSectionProps {
	locale: string;
	companyId?: string;
	title?: string;
}

export const TasksSection = async ({ locale, companyId, title }: TasksSectionProps) => {
	const t = await getTranslations(i18Namespace.specialization);

	const additionalParams = companyId ? `?companies=${companyId}` : '';
	const detailRoute = `/${locale}${ROUTES.tasks.page}${additionalParams}`;

	const tasks = await getTasksList({
		limit: 3,
		companyId,
	});

	return (
		<SectionWrapper
			actionTitle={t(Specializations.TASKS_LINK)}
			actionRoute={detailRoute}
			title={title ?? t(Specializations.TASKS_TITLE)}
		>
			<TasksList tasks={tasks.data} />
		</SectionWrapper>
	);
};
