import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import { GetQuestionsListParamsRequest, GetQuestionsListResponse } from '@/entities/question';
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
	const { title, skills, complexity, rate, page = '1' } = await searchParams;

	const pageNum = Number(page);

	const specializationId = SPEC_MAP[specialization];
	if (!specializationId) notFound();

	setRequestLocale(locale);

	const qs = new URLSearchParams();
	qs.set('page', pageNum.toString());
	qs.set('specialization', specializationId.toString());
	qs.set('limit', QUESTIONS_PER_PAGE.toString());
	qs.set('skillFilterMode', 'ANY');
	if (skills) qs.set('skills', skills.toString());
	if (complexity) qs.set('complexity', complexity);
	if (rate) qs.set('rate', rate);
	if (title) qs.set('title', title);

	const res = await fetch(`https://api.yeahub.ru/questions/public-questions?${qs}`, {
		cache: 'force-cache',
	});

	if (!res.ok) throw new Error('Failed to load questions', { cause: res });
	const questions = (await res.json()) as GetQuestionsListResponse;

	return (
		<QuestionsPage
			locale={locale}
			page={pageNum}
			questionsResponse={questions}
			specialization={specialization}
			searchParamsTitle={title}
		/>
	);
};

export default MainQuestionsPage;
