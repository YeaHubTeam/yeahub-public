import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { CreateQuizPage } from '@/pages/CreateQuizPage';
import { InterviewQuiz, InterviewQuizCreate, i18Namespace } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';

interface PageProps {
	params: Promise<{ locale: string; specialization: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.interviewQuizCreate });

	const title = t(InterviewQuizCreate.TITLE);
	const description = `${t(InterviewQuizCreate.MODE_SELECT)}. ${t(InterviewQuizCreate.MODE_NEW)}, ${t(InterviewQuizCreate.MODE_REPEAT)}, ${t(InterviewQuizCreate.MODE_RANDOM)}.`;
	const keywords = [
		title,
		t(InterviewQuizCreate.MODE_NEW),
		t(InterviewQuizCreate.MODE_REPEAT),
		t(InterviewQuizCreate.MODE_RANDOM),
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

export const dynamic = 'auto';

const MainCreateQuizPage = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);

	const tCreate = await getTranslations({ locale, namespace: i18Namespace.interviewQuizCreate });
	const tQuiz = await getTranslations({ locale, namespace: i18Namespace.interviewQuiz });

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/quiz/new`;
	const quizUrl = `${siteUrl}/${locale}/quiz`;

	const title = tCreate(InterviewQuizCreate.TITLE);

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebPage',
				'@id': pageUrl,
				url: pageUrl,
				name: title,
				description: `${tCreate(InterviewQuizCreate.MODE_SELECT)}. ${tCreate(InterviewQuizCreate.MODE_NEW)}, ${tCreate(InterviewQuizCreate.MODE_REPEAT)}, ${tCreate(InterviewQuizCreate.MODE_RANDOM)}.`,
				isPartOf: {
					'@type': 'WebSite',
					url: siteUrl,
					name: 'YeaHub',
				},
				potentialAction: {
					'@type': 'CreateAction',
					name: tCreate(InterviewQuizCreate.CREATE_BUTTON),
					target: quizUrl,
					result: {
						'@type': 'LearningResource',
						name: tQuiz(InterviewQuiz.TITLE),
						learningResourceType: 'Quiz',
					},
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
						name: tQuiz(InterviewQuiz.TITLE),
						item: quizUrl,
					},
					{
						'@type': 'ListItem',
						position: 3,
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
			<CreateQuizPage locale={locale} />
		</>
	);
};

export default MainCreateQuizPage;
