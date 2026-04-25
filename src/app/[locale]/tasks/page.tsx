import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getLanguages, getTaskCategories, getTasksList } from '@/entities/task';
import type { TaskDifficulty } from '@/entities/task';
import { TasksPage as TasksPageComponent } from '@/pages/TasksPage';
import { Task, i18Namespace } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';

export const dynamic = 'force-dynamic';

interface PageProps {
	searchParams?: Promise<{
		page?: string;
		title?: string;
		difficulty?: string;
		langIds?: string;
		category?: string;
	}>;
	params: Promise<{
		locale: string;
	}>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.task });

	const titleTasks = t(Task.TITLE_SHORT);
	const titleKeywords = t(Task.DESCRIPTION_TAB_TITLE);
	const title = `${titleTasks} / ${titleKeywords}`;
	const description = `${titleTasks}. ${titleKeywords}.`;
	const keywords = [titleTasks, titleKeywords];

	return {
		title,
		description,
		keywords,
		openGraph: {
			title,
			description,
			type: 'website',
		},
	};
}

const TasksPage = async ({ searchParams, params }: PageProps) => {
	const resolvedSearchParams = await searchParams;
	const { locale } = await params;

	setRequestLocale(locale);

	const page = Number(resolvedSearchParams?.page) || 1;
	const title = resolvedSearchParams?.title || undefined;
	const difficulty = resolvedSearchParams?.difficulty
		? (Number(resolvedSearchParams.difficulty) as TaskDifficulty)
		: undefined;
	const langIds = resolvedSearchParams?.langIds
		? resolvedSearchParams.langIds.split(',').map(Number)
		: undefined;
	const category = resolvedSearchParams?.category || undefined;

	const [tasksResponse, categoriesResponse, languagesResponse] = await Promise.all([
		getTasksList({ page, title, difficulty, langIds, category, isActive: true }).catch(() => ({
			data: [] as Awaited<ReturnType<typeof getTasksList>>['data'],
			total: 0,
			limit: 10,
			page: 1,
		})),
		getTaskCategories().catch(() => []),
		getLanguages().catch(() => []),
	]);

	const categoriesFromApi = (categoriesResponse ?? []).map((c) => c.name);
	let categories: string[];
	if (categoriesFromApi.length > 0) {
		categories = categoriesFromApi;
	} else {
		const unfilteredTasks = await getTasksList({ isActive: true, limit: 100 }).catch(() => ({
			data: [] as Awaited<ReturnType<typeof getTasksList>>['data'],
		}));
		categories = Array.from(
			new Set((unfilteredTasks.data ?? []).map((t) => t.mainCategory).filter(Boolean)),
		);
	}
	const languages = languagesResponse ?? [];

	const hasFilters = !!title || !!difficulty || (langIds?.length ?? 0) > 0 || !!category;

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/tasks`;

	const t = await getTranslations({ locale, namespace: i18Namespace.task });
	const titleTasks = t(Task.TITLE_SHORT);
	const titleKeywords = t(Task.DESCRIPTION_TAB_TITLE);

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebPage',
				'@id': pageUrl,
				url: pageUrl,
				name: `${titleTasks} / ${titleKeywords}`,
				description: `${titleTasks}. ${titleKeywords}.`,
				isPartOf: {
					'@type': 'WebSite',
					url: siteUrl,
					name: 'YeaHub',
				},
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
			<TasksPageComponent
				locale={locale}
				tasks={tasksResponse.data ?? []}
				page={page}
				total={tasksResponse.total ?? 0}
				limit={tasksResponse.limit ?? 10}
				hasFilters={hasFilters}
				categories={categories}
				languages={languages}
			/>
		</>
	);
};

export default TasksPage;
