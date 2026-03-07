import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getQuestionsSpecializationByIdCount } from '@/entities/question';
import { QuizResultPage } from '@/pages/QuizResult';
import { InterviewQuizResult, i18Namespace } from '@/shared/config';

interface PageProps {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ specializationId?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.interviewQuizResult });

	const title = t(InterviewQuizResult.INTERVIEW_STATISTIC_TITLE);

	return {
		title,
	};
}

export const dynamic = 'auto';

const MainResultQuizPage = async ({ params, searchParams }: PageProps) => {
	const { locale } = await params;
	const { specializationId } = await searchParams;
	setRequestLocale(locale);

	const quizResults = specializationId
		? await getQuestionsSpecializationByIdCount(Number(specializationId))
		: undefined;

	return <QuizResultPage quizResults={quizResults} />;
};

export default MainResultQuizPage;
