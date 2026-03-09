import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LearningPage as LearningPageComponent } from '@/pages/LearningPage';
import { Learning, i18Namespace } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.learning });

	const title = t(Learning.BANNER_TITLE);
	const description = t(Learning.BANNER_DESCRIPTION);
	const keywords = [
		title,
		t(Learning.PROCESS_TITLE),
		t(Learning.TEAM_TITLE),
		t(Learning.SUPPORT_TITLE),
		t(Learning.PROJECT_TITLE),
		t(Learning.EXPERIENCE_TITLE),
		t(Learning.MENTORS_TITLE),
		t(Learning.GURU_TITLE),
	];

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

const LearningPage = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.learning });

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/learning`;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebPage',
				'@id': pageUrl,
				url: pageUrl,
				name: t(Learning.BANNER_TITLE),
				description: t(Learning.BANNER_DESCRIPTION),
				isPartOf: {
					'@type': 'WebSite',
					url: siteUrl,
					name: 'YeaHub',
				},
			},
			{
				'@type': 'EducationalOrganization',
				name: 'YeaHub',
				url: siteUrl,
				description: t(Learning.BANNER_DESCRIPTION),
				hasCredential: [
					t(Learning.PROCESS_TITLE),
					t(Learning.TECHNO_TITLE),
					t(Learning.TEAM_TITLE),
					t(Learning.SUPPORT_TITLE),
					t(Learning.PROJECT_TITLE),
					t(Learning.EXPERIENCE_TITLE),
				],
			},
			{
				'@type': 'Course',
				name: t(Learning.BANNER_TITLE),
				description: t(Learning.BANNER_DESCRIPTION),
				url: pageUrl,
				provider: {
					'@type': 'EducationalOrganization',
					name: 'YeaHub',
					url: siteUrl,
				},
				hasCourseInstance: {
					'@type': 'CourseInstance',
					courseMode: 'online',
					courseWorkload: t(Learning.PROCESS_DESCRIPTION),
				},
				about: [
					{ '@type': 'Thing', name: t(Learning.PROCESS_TITLE) },
					{ '@type': 'Thing', name: t(Learning.TECHNO_TITLE) },
					{ '@type': 'Thing', name: t(Learning.TEAM_TITLE) },
					{ '@type': 'Thing', name: t(Learning.SUPPORT_TITLE) },
					{ '@type': 'Thing', name: t(Learning.PROJECT_TITLE) },
					{ '@type': 'Thing', name: t(Learning.EXPERIENCE_TITLE) },
				],
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
						name: t(Learning.BANNER_TITLE),
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
			<LearningPageComponent />
		</>
	);
};

export default LearningPage;
