import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import { getTaskById } from '@/entities/task';
import { TaskPage as TaskPageComponent } from '@/pages/TaskPage';

export const dynamic = 'force-dynamic';

interface PageProps {
	params: Promise<{ locale: string; taskId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { taskId, locale } = await params;
	setRequestLocale(locale);

	const task = await getTaskById(taskId).catch(() => null);
	if (!task) return { title: 'Task not found' };

	const plainDescription =
		task.description
			?.replace(/<[^>]*>/g, '')
			.trim()
			.slice(0, 160) ?? '';

	return {
		title: task.name,
		description: plainDescription,
		openGraph: {
			title: task.name,
			description: plainDescription,
			type: 'article',
		},
	};
}

const TaskDetailPage = async ({ params }: PageProps) => {
	const { locale, taskId } = await params;
	setRequestLocale(locale);

	const task = await getTaskById(taskId).catch(() => null);
	if (!task) notFound();

	return <TaskPageComponent task={task} />;
};

export default TaskDetailPage;
