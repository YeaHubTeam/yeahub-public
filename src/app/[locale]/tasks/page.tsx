import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { TaskCategoryCode, TaskDifficulty, getTasksList } from '@/entities/tasks';
import { TasksPage } from '@/pages/TasksPage';
import { i18Namespace, locales } from '@/shared/config';
import { Tasks } from '@/shared/config/i18n/i18nTranslations';
import { APP_ROUTE } from '@/shared/config/router/constants';

interface PageProps {
	params: Promise<{ locale: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = 'auto';

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations({ locale, namespace: i18Namespace.tasks });

	return {
		title: t(Tasks.TITLE_SHORT),
		description: t(Tasks.STUB_EMPTY_TASKS_PUBLIC_SUBTITLE),
		keywords: ['coding', 'tasks', 'programming challenges'],
	};
}

const MainTasksPage = async ({ params, searchParams }: PageProps) => {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: i18Namespace.tasks });
	const { title, difficulty, langIds, category, page = '1' } = await searchParams;

	const pageNum = Number(page);
	const parsedDifficulty = difficulty ? (Number(difficulty) as TaskDifficulty) : undefined;
	const parsedLangIds =
		typeof langIds === 'string'
			? langIds.split(',').map(Number).filter(Boolean)
			: Array.isArray(langIds)
				? langIds.map(Number)
				: undefined;

	setRequestLocale(locale);

	const [tasksResponse] = await Promise.all([
		getTasksList({
			page: pageNum,
			title: title as string | undefined,
			difficulty: parsedDifficulty,
			langIds: parsedLangIds,
			category: category as TaskCategoryCode | undefined,
		}),
	]);

	const hasFilters = !!difficulty || !!langIds || !!category || !!title;
	const siteUrl = process.env.APP_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/tasks/`;
	const titleTasks = t(Tasks.TITLE_SHORT);
	const faqEntities = tasksResponse.data?.map((t) => ({
		'@type': 'Task' as const,
		name: t.name,
	}));
	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'TaskPage',
				'@id': pageUrl,
				name: `${titleTasks}`,
				mainEntity: faqEntities,
			},
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						name: 'YeaHub',
						item: siteUrl,
					},
					{
						'@type': 'ListItem',
						position: 2,
						name: titleTasks,
						item: pageUrl,
					},
				],
			},
		],
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<TasksPage locale={locale} tasks={tasksResponse.data || []} hasFilters={hasFilters} />
		</>
	);
};

export default MainTasksPage;
