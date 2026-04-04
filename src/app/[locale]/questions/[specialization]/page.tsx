import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { GetQuestionsListParamsRequest, getQuestionsList } from '@/entities/question';
import { getSkills } from '@/entities/skill';
import {
	getSpecializationBySlug,
	getSpecializationSlugs,
	getSpecializations,
} from '@/entities/specialization';
import { QuestionsPage } from '@/pages/QuestionsPage';
import { Landing, Questions, i18Namespace } from '@/shared/config';
import { locales } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';
import { QUESTIONS_PER_PAGE } from '@/shared/libs';

interface PageProps {
	params: Promise<{ locale: string; specialization: string }>;
	searchParams: Promise<GetQuestionsListParamsRequest>;
}

export const dynamic = 'auto';

export const generateStaticParams = async () => {
	try {
		const { data: specializations } = await getSpecializationSlugs();

		return locales.flatMap((locale) =>
			specializations.map((spec) => ({
				locale,
				specialization: spec.slug,
			})),
		);
	} catch (error) {
		console.error(error);
		return [];
	}
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale, specialization } = await params;
	setRequestLocale(locale);
	const currentSpecialization = await getSpecializationBySlug(specialization);
	if (!currentSpecialization) {
		return { title: 'Not Found' };
	}
	const [tQuestions, tLanding] = await Promise.all([
		getTranslations({ locale, namespace: i18Namespace.questions }),
		getTranslations({ locale, namespace: i18Namespace.landing }),
	]);
	const specializationTitle = currentSpecialization.title;
	const title = tQuestions(Questions.QUESTIONS_TITLE, {
		specialization: specializationTitle,
	});
	const description = tLanding(Landing.QUESTIONS_DESCRIPTION);
	const keywords = [
		title,
		specializationTitle,
		tQuestions(Questions.COUNT),
		tLanding(Landing.QUESTIONS_TITLE),
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

const MainQuestionsPage = async ({ params, searchParams }: PageProps) => {
	const { locale, specialization } = await params;
	const { titleOrDescription, skills, complexity, rate, page = '1' } = await searchParams;

	const pageNum = Number(page);

	const currentSpecialization = await getSpecializationBySlug(specialization);

	if (!currentSpecialization) notFound();

	const specializationId = currentSpecialization.id;

	setRequestLocale(locale);

	const [questionsResponse, specializationsResponse, skillsResponse] = await Promise.all([
		getQuestionsList({
			page: pageNum,
			limit: QUESTIONS_PER_PAGE,
			specializationId,
			skills,
			complexity,
			rate,
			titleOrDescription,
			skillFilterMode: 'ANY',
		}),
		getSpecializations({ limit: 5 }),
		getSkills({ limit: 5, specializations: specializationId }),
	]);

	const hasFilters = !!skills || !!complexity || !!rate || !!titleOrDescription;

	const specializationTitle = currentSpecialization.title;

	const siteUrl = process.env.NEXT_PUBLIC_APP_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/questions/${specialization}`;

	const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();

	const faqEntities = questionsResponse.data?.map((q) => ({
		'@type': 'Question' as const,
		name: q.title,
		acceptedAnswer: {
			'@type': 'Answer' as const,
			text: stripHtml(q.shortAnswer).slice(0, 2000),
		},
	}));

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'FAQPage',
				'@id': pageUrl,
				name: `${specializationTitle || specialization}`,
				mainEntity: faqEntities,
			},
			{
				'@type': 'CollectionPage',
				name: `${specializationTitle || specialization}`,
				url: pageUrl,
				mainEntity: {
					'@type': 'ItemList',
					numberOfItems: questionsResponse.total,
					itemListElement: questionsResponse.data?.map((q, index) => ({
						'@type': 'ListItem',
						position: index + 1 + (pageNum - 1) * QUESTIONS_PER_PAGE,
						url: `${siteUrl}/${locale}/questions/${specialization}/${q.slug}`,
						name: q.title,
					})),
				},
			},
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						name: 'Questions',
						item: `${siteUrl}/${locale}/questions`,
					},
					{
						'@type': 'ListItem',
						position: 2,
						name: specializationTitle || specialization,
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
			<QuestionsPage
				locale={locale}
				page={pageNum}
				questions={questionsResponse?.data || []}
				total={questionsResponse?.total || 0}
				limit={questionsResponse?.limit || 0}
				specialization={specialization}
				hasFilters={hasFilters}
				initialSpecializations={specializationsResponse}
				initialSkills={skillsResponse}
				currentSpecialization={currentSpecialization}
			/>
		</>
	);
};

export default MainQuestionsPage;
