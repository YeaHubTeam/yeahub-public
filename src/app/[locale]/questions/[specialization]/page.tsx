import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import { GetQuestionsListParamsRequest, getQuestionsList } from '@/entities/question';
import { getSkills } from '@/entities/skill';
import { getSpecializations } from '@/entities/specialization';
import { QuestionsPage } from '@/pages/QuestionsPage';
import { locales } from '@/shared/config';
import { QUESTIONS_PER_PAGE, SPEC_MAP } from '@/shared/libs';

interface PageProps {
	params: Promise<{ locale: string; specialization: keyof typeof SPEC_MAP }>;
	searchParams: Promise<GetQuestionsListParamsRequest>;
}

export const dynamic = 'auto';

export const generateStaticParams = () => {
	return locales.flatMap((locale) =>
		Object.keys(SPEC_MAP).map((specSlug) => ({
			locale,
			specialization: specSlug,
		})),
	);
};

const MainQuestionsPage = async ({ params, searchParams }: PageProps) => {
	const { locale, specialization } = await params;
	const { titleOrDescription, skills, complexity, rate, page = '1' } = await searchParams;

	const pageNum = Number(page);

	const specializationId = SPEC_MAP[specialization];
	if (!specializationId) notFound();

	setRequestLocale(locale);

	const [questionsResponse, specializationsResponse, skillsResponse] = await Promise.all([
		getQuestionsList({
			page: pageNum,
			limit: QUESTIONS_PER_PAGE,
			specialization: specializationId,
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
		/>
	);
};

export default MainQuestionsPage;
