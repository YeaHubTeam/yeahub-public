import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { QuizPage } from '@/pages/QuizPage';
import { InterviewQuiz, i18Namespace } from '@/shared/config';

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
	return <QuizPage />;
};

export default MainQuizPage;
