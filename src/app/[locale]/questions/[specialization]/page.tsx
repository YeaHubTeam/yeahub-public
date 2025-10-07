import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import { GetQuestionsListResponse } from '@/entities/question';
import { QuestionsPage } from '@/pages-components/QuestionsPage';
import { locales } from '@/shared/config/i18n/i18n.locales';
import { SPEC_MAP } from '@/shared/constants/mappingStaticParams';
import { QUESTIONS_PER_PAGE } from '@/shared/constants/queryConstants';

interface PageProps {
	params: Promise<{ locale: string; specialization: keyof typeof SPEC_MAP }>;
	searchParams: Promise<{ page?: string; difficulty?: string; skill?: string }>;
}

export const dynamic = 'force-static';

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
	const { page = '1' } = await searchParams;

	const pageNum = Number(page);

	const specializationId = SPEC_MAP[specialization];
	if (!specializationId) notFound();

	setRequestLocale(locale);

	const qs = new URLSearchParams({
		specialization: specializationId.toString(),
		page: page,
		skillFilterMode: 'ALL',
		limit: QUESTIONS_PER_PAGE.toString(),
	});

	const res = await fetch(`https://api.yeahub.ru/questions/public-questions?${qs.toString()}`, {
		cache: 'force-cache',
	});

	if (!res.ok) throw new Error('Failed to load questions');
	const questions = (await res.json()) as GetQuestionsListResponse;

	return <QuestionsPage locale={locale} page={pageNum} questionsResponse={questions} />;
};

export default MainQuestionsPage;
