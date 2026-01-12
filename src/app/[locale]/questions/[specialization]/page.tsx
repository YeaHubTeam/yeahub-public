import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import { GetQuestionsListParamsRequest, getQuestionsList } from '@/entities/question';
import { QuestionsPage } from '@/pages/QuestionsPage';
import { locales } from '@/shared/config';
import { SPEC_MAP } from '@/shared/libs';
import { QUESTIONS_PER_PAGE } from '@/shared/libs';

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

	const response = await getQuestionsList({
		page: pageNum,
		limit: QUESTIONS_PER_PAGE,
		specialization: specializationId,
		skills,
		complexity,
		rate,
		titleOrDescription,
		skillFilterMode: 'ANY',
	});

	const hasFilters = !!skills || !!complexity || !!rate || !!titleOrDescription;

	return (
		<QuestionsPage
			locale={locale}
			page={pageNum}
			questions={response?.data || []}
			total={response?.total || 0}
			limit={response?.limit || 0}
			specialization={specialization}
			hasFilters={hasFilters}
		/>
	);
};

export default MainQuestionsPage;
