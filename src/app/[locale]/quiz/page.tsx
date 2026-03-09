import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { QuizPage } from '@/pages/QuizPage';
import { InterviewQuiz, i18Namespace } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.interviewQuiz });

	const title = t(InterviewQuiz.TITLE);
	const description = `${t(InterviewQuiz.ANSWER_SHOW)} / ${t(InterviewQuiz.ANSWER_HIDE)} — ${t(InterviewQuiz.COMPLETE)}.`;
	const keywords = [
		title,
		t(InterviewQuiz.COMPLETE),
		t(InterviewQuiz.NEXT),
		t(InterviewQuiz.ANSWER_SHOW),
		t(InterviewQuiz.ANSWER_HIDE),
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

const MainQuizPage = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.interviewQuiz });

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/quiz`;

	const title = t(InterviewQuiz.TITLE);

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'LearningResource',
				'@id': pageUrl,
				url: pageUrl,
				name: title,
				description: `${t(InterviewQuiz.ANSWER_SHOW)} / ${t(InterviewQuiz.ANSWER_HIDE)} — ${t(InterviewQuiz.COMPLETE)}.`,
				learningResourceType: 'Quiz',
				interactivityType: 'active',
				provider: {
					'@type': 'Organization',
					name: 'YeaHub',
					url: siteUrl,
				},
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
			<QuizPage />
		</>
	);
};

export default MainQuizPage;
