import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LandingPage as LandingPageComponent } from '@/pages/LandingPage';
import { Landing, i18Namespace } from '@/shared/config';

export const dynamic = 'force-static';

export function generateStaticParams() {
	return ['ru'].map((locale) => ({ locale }));
}

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.landing });

	const title = t(Landing.SEO_TITLE);
	const description = t(Landing.SEO_DESCRIPTION);
	const keywords = t(Landing.SEO_KEYWORDS);
	const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://yeahub.ru').replace(/\/$/, '');
	const pageUrl = `${siteUrl}/${locale}`;

	return {
		title,
		description,
		keywords,
		alternates: {
			canonical: pageUrl,
		},
		openGraph: {
			title,
			description,
			type: 'website',
			url: pageUrl,
		},
	};
}

const HomePage = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.landing });

	const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://yeahub.ru').replace(/\/$/, '');
	const pageUrl = `${siteUrl}/${locale}`;

	const title = t(Landing.HEADER_TITLE);
	const description = t(Landing.HEADER_SUBTITLE);
	const seoDescription = t(Landing.SEO_DESCRIPTION);

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Organization',
				'@id': `${siteUrl}/#organization`,
				name: 'YeaHub',
				url: siteUrl,
				description: seoDescription,
				sameAs: [],
			},
			{
				'@type': 'WebSite',
				'@id': `${siteUrl}/#website`,
				url: siteUrl,
				name: 'YeaHub',
				publisher: {
					'@id': `${siteUrl}/#organization`,
				},
				potentialAction: {
					'@type': 'SearchAction',
					target: `${siteUrl}/${locale}/questions?titleOrDescription={search_term_string}`,
					'query-input': 'required name=search_term_string',
				},
			},
			{
				'@type': 'WebPage',
				'@id': pageUrl,
				url: pageUrl,
				name: title,
				description: description,
				isPartOf: {
					'@id': `${siteUrl}/#website`,
				},
				about: {
					'@id': `${siteUrl}/#organization`,
				},
				hasPart: [
					{
						'@type': 'ItemList',
						name: t(Landing.DIFFICULTY_TITLE),
						description: t(Landing.DIFFICULTY_DESCRIPTION),
						itemListElement: [
							{
								'@type': 'ListItem',
								position: 1,
								name: t(Landing.DIFFICULTY_CARDS_FIRST_TITLE),
								description: t(Landing.DIFFICULTY_CARDS_FIRST_DESCRIPTION),
							},
							{
								'@type': 'ListItem',
								position: 2,
								name: t(Landing.DIFFICULTY_CARDS_SECOND_TITLE),
								description: t(Landing.DIFFICULTY_CARDS_SECOND_DESCRIPTION),
							},
							{
								'@type': 'ListItem',
								position: 3,
								name: t(Landing.DIFFICULTY_CARDS_THIRD_TITLE),
								description: t(Landing.DIFFICULTY_CARDS_THIRD_DESCRIPTION),
							},
							{
								'@type': 'ListItem',
								position: 4,
								name: t(Landing.DIFFICULTY_CARDS_FOURTH_TITLE),
								description: t(Landing.DIFFICULTY_CARDS_FOURTH_DESCRIPTION),
							},
							{
								'@type': 'ListItem',
								position: 5,
								name: t(Landing.DIFFICULTY_CARDS_FIFTH_TITLE),
								description: t(Landing.DIFFICULTY_CARDS_FIFTH_DESCRIPTION),
							},
							{
								'@type': 'ListItem',
								position: 6,
								name: t(Landing.DIFFICULTY_CARDS_SIXTH_TITLE),
								description: t(Landing.DIFFICULTY_CARDS_SIXTH_DESCRIPTION),
							},
						],
					},
					{
						'@type': 'ItemList',
						name: t(Landing.PREPARE_INTERVIEW_TITLE),
						description: t(Landing.PREPARE_INTERVIEW_SUBTITLE),
						itemListElement: [
							{
								'@type': 'ListItem',
								position: 1,
								name: 'Frontend',
								description: t(Landing.INTERVIEW_SPECIALIZATION_CARD_DESCRIPTION_FRONTEND),
							},
							{
								'@type': 'ListItem',
								position: 2,
								name: 'Python Backend',
								description: t(Landing.INTERVIEW_SPECIALIZATION_CARD_DESCRIPTION_PYTHON),
							},
							{
								'@type': 'ListItem',
								position: 3,
								name: 'Java Backend',
								description: t(Landing.INTERVIEW_SPECIALIZATION_CARD_DESCRIPTION_JAVA),
							},
							{
								'@type': 'ListItem',
								position: 4,
								name: 'Node.js Backend',
								description: t(Landing.INTERVIEW_SPECIALIZATION_CARD_DESCRIPTION_NODE_JS),
							},
							{
								'@type': 'ListItem',
								position: 5,
								name: 'QA Engineer',
								description: t(Landing.INTERVIEW_SPECIALIZATION_CARD_DESCRIPTION_QA_ENGINEER),
							},
							{
								'@type': 'ListItem',
								position: 6,
								name: 'Golang Backend',
								description: t(Landing.INTERVIEW_SPECIALIZATION_CARD_DESCRIPTION_GOLANG),
							},
						],
					},
					{
						'@type': 'ItemList',
						name: t(Landing.INTERVIEW_QUESTIONS_TASKS_TITLE),
						description: t(Landing.INTERVIEW_QUESTIONS_TASKS_DESCRIPTION),
						itemListElement: [
							{
								'@type': 'ListItem',
								position: 1,
								name: t(Landing.INTERVIEW_QUESTIONS_TASKS_CARD_QUESTIONS_TITLE),
								description: t(Landing.INTERVIEW_QUESTIONS_TASKS_CARD_QUESTIONS_DESCRIPTION),
								url: `${siteUrl}/${locale}/questions`,
							},
							{
								'@type': 'ListItem',
								position: 2,
								name: t(Landing.INTERVIEW_QUESTIONS_TASKS_CARD_TASKS_TITLE),
								description: t(Landing.INTERVIEW_QUESTIONS_TASKS_CARD_TASKS_DESCRIPTION),
								url: `${siteUrl}/${locale}/tasks`,
							},
							{
								'@type': 'ListItem',
								position: 3,
								name: t(Landing.INTERVIEW_QUESTIONS_TASKS_CARD_INTERVIEWS_TITLE),
								description: t(Landing.INTERVIEW_QUESTIONS_TASKS_CARD_INTERVIEWS_DESCRIPTION),
								url: `${siteUrl}/${locale}/collections`,
							},
						],
					},
					{
						'@type': 'ItemList',
						name: t(Landing.TRAINER_PROGRESS_TITLE),
						description: t(Landing.TRAINER_PROGRESS_SUBTITLE),
						itemListElement: [
							{
								'@type': 'ListItem',
								position: 1,
								name: t(Landing.TRAINER_PROGRESS_BLOCK_FIRST_TITLE),
								description: t(Landing.TRAINER_PROGRESS_BLOCK_FIRST_DESCRIPTION),
							},
							{
								'@type': 'ListItem',
								position: 2,
								name: t(Landing.TRAINER_PROGRESS_BLOCK_SECOND_TITLE),
								description: t(Landing.TRAINER_PROGRESS_BLOCK_SECOND_DESCRIPTION),
							},
						],
					},
					{
						'@type': 'ItemList',
						name: t(Landing.RESUME_TITLE),
						description: t(Landing.RESUME_DESCRIPTION),
						itemListElement: [
							{
								'@type': 'ListItem',
								position: 1,
								name: t(Landing.RESUME_CARD_ATS_TITLE),
								description: t(Landing.RESUME_CARD_ATS_DESCRIPTION),
							},
							{
								'@type': 'ListItem',
								position: 2,
								name: t(Landing.RESUME_CARD_KEYWORDS_TITLE),
								description: t(Landing.RESUME_CARD_KEYWORDS_DESCRIPTION),
							},
							{
								'@type': 'ListItem',
								position: 3,
								name: t(Landing.RESUME_CARD_VACANCY_TITLE),
								description: t(Landing.RESUME_CARD_VACANCY_DESCRIPTION),
							},
						],
					},
					{
						'@type': 'ItemList',
						name: t(Landing.TRAINING_TITLE),
						description: t(Landing.TRAINING_DESCRIPTION),
						itemListElement: [
							{
								'@type': 'ListItem',
								position: 1,
								name: t(Landing.TRAINING_CARD_ROADMAP_TITLE),
								description: t(Landing.TRAINING_CARD_ROADMAP_DESCRIPTION),
							},
							{
								'@type': 'ListItem',
								position: 2,
								name: t(Landing.TRAINING_CARD_MENTOR_TITLE),
								description: t(Landing.TRAINING_CARD_MENTOR_DESCRIPTION),
							},
							{
								'@type': 'ListItem',
								position: 3,
								name: t(Landing.TRAINING_CARD_MATERIALS_TITLE),
								description: t(Landing.TRAINING_CARD_MATERIALS_DESCRIPTION),
							},
						],
					},
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
						name: title,
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
			<LandingPageComponent />
		</>
	);
};
export default HomePage;
