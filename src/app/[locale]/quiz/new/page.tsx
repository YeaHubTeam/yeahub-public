import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { CreateNewMockQuizParamsRequest } from '@/entities/quiz';
import { getSkills } from '@/entities/skill';
import { DEFAULT_SPECIALIZATION_ID, getSpecializations } from '@/entities/specialization';
import { CreateQuizPage } from '@/pages/CreateQuizPage';
import { InterviewQuiz, InterviewQuizCreate, i18Namespace } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';

interface PageProps {
	params: Promise<{ locale: string; specialization: string }>;
	searchParams: Promise<CreateNewMockQuizParamsRequest>;
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

const MainCreateQuizPage = async ({ params, searchParams }: PageProps) => {
	const { locale } = await params;
	const { specialization = DEFAULT_SPECIALIZATION_ID } = await searchParams;

	setRequestLocale(locale);

	const tCreate = await getTranslations({ locale, namespace: i18Namespace.interviewQuizCreate });
	const tQuiz = await getTranslations({ locale, namespace: i18Namespace.interviewQuiz });

	const siteUrl = process.env.APP_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/quiz/new`;
	const quizUrl = `${siteUrl}/${locale}/quiz`;

	const title = tCreate(InterviewQuizCreate.TITLE);

	const [specializationsResponse, skillsResponse] = await Promise.all([
		getSpecializations({ limit: 5 }),
		getSkills({ limit: 5, specializations: specialization }),
	]);

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
			<CreateQuizPage
				locale={locale}
				initialSpecializations={specializationsResponse}
				initialSkills={skillsResponse}
			/>
		</>
	);
};

export default MainCreateQuizPage;
