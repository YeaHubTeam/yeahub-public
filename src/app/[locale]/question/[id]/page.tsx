import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import { getQuestionById, getQuestionsList } from '@/entities/question';
import { QuestionPage as QuestionPageComponent } from '@/pages/QuestionPage';
import { locales } from '@/shared/config';
import { COUNT_TO_GET_QUESTIONS_FOR_SSG } from '@/shared/libs';

interface PageProps {
	params: Promise<{ locale: string; id: string }>;
}

export const generateStaticParams = async () => {
	try {
		const { data } = await getQuestionsList({
			page: 1,
			limit: COUNT_TO_GET_QUESTIONS_FOR_SSG,
			skillFilterMode: 'ANY',
		});

		return locales.flatMap((locale) =>
			data.map(({ id }) => ({
				locale,
				id: id.toString(),
			})),
		);
	} catch (error) {
		console.error('generateStaticParams: fallback to empty list', error);
		return [];
	}
};

export const dynamic = 'force-static';

const QuestionPage = async ({ params }: PageProps) => {
	const { locale, id } = await params;

	setRequestLocale(locale);

	const questionId = Number(id);
	if (isNaN(questionId)) {
		notFound();
	}

	const question = await getQuestionById(questionId);

	if (!question) {
		notFound();
	}

	return <QuestionPageComponent question={question} />;
};

export default QuestionPage;
