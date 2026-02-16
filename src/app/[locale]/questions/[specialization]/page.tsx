import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import { GetQuestionsListParamsRequest, getQuestionsList } from '@/entities/question';
import { getSkills } from '@/entities/skill';
import {
	getSpecializationBySlug,
	getSpecializationSlugs,
	getSpecializations,
} from '@/entities/specialization';
import { QuestionsPage } from '@/pages/QuestionsPage';
import { locales } from '@/shared/config';
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

const MainQuestionsPage = async ({ params, searchParams }: PageProps) => {
	const { locale, specialization } = await params;
	const { titleOrDescription, skills, complexity, rate, page = '1' } = await searchParams;

	const pageNum = Number(page);

	const currentSpec = await getSpecializationBySlug(specialization);

	if (!currentSpec) notFound();

	const specializationId = currentSpec.id;

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

	const specializationTitle = currentSpec.title;

	return (
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
			currentSpec={currentSpec}
			specializationTitle={specializationTitle || ''}
		/>
	);
};

export default MainQuestionsPage;
