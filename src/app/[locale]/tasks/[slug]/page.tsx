import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getTranslations } from 'next-intl/server';

import { getTaskBySlug, getTasksSlugs } from '@/entities/tasks';
import { TaskPage as TaskPageComponent } from '@/pages/TaskPage';
import { Tasks, Translation, i18Namespace } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';

interface PageProps {
	params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug, locale } = await params;
	const t = await getTranslations({ locale, namespace: i18Namespace.translation });
	const task = await getTaskBySlug(slug).catch(() => null);

	if (!task) {
		return { title: t(Translation.ERROR_404_TITLE) };
	}

	const title = task.name;

	const description = task.description.slice(0, 160).replace(/<[^>]*>/g, '') || task.name;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: 'article',
		},
	};
}

export const generateStaticParams = async () => {
	try {
		const { data: slugs } = await getTasksSlugs();

		return slugs.map((slug) => ({
			slug: slug.slug,
		}));
	} catch (error) {
		console.error('generateStaticParams error:', error);
		return [];
	}
};

export const dynamic = 'force-dynamic';

const TaskPage = async ({ params }: PageProps) => {
	const { locale, slug } = await params;

	const t = await getTranslations({ locale, namespace: i18Namespace.tasks });
	const task = await getTaskBySlug(slug);

	if (!task) {
		notFound();
	}

	const siteUrl = process.env.NEXT_PUBLIC_APP_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/tasks/${slug}`;
	const titleTasks = t(Tasks.TITLE_SHORT);
	const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'TaskPage',
				'@id': pageUrl,
				name: task.name,
				description: stripHtml(task.description) || task.name,
				url: pageUrl,
				inLanguage: locale,
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
						item: `${siteUrl}/${locale}/tasks`,
					},
					{
						'@type': 'ListItem',
						position: 3,
						name: task.name,
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
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(jsonLd),
				}}
			/>

			<TaskPageComponent task={task} />
		</>
	);
};

export default TaskPage;
