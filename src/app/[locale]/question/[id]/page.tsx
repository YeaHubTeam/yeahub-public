import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import { getQuestionById, getQuestionsList } from '@/entities/question';
import { QuestionPage as QuestionPageComponent } from '@/pages/QuestionPage';
import { locales } from '@/shared/config';
import { DEFAULT_SPECIALIZATION_SLUG, SPEC_MAP, getSpecializationSlugById } from '@/shared/libs';

interface PageProps {
	params: Promise<{ locale: string; id: string }>;
	searchParams: Promise<{ specialization?: string }>;
}

export const generateStaticParams = async () => {
	try {
		const { data } = await getQuestionsList({ page: 1, limit: 100, skillFilterMode: 'ANY' });

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

const QuestionPage = async ({ params, searchParams }: PageProps) => {
	const { locale, id } = await params;
	const { specialization: specializationQuery } = await searchParams;

	setRequestLocale(locale);

	const questionId = Number(id);
	if (isNaN(questionId)) {
		notFound();
	}

	const question = await getQuestionById(questionId);

	if (!question) {
		notFound();
	}

	const isSpecializationValid =
		specializationQuery && Object.prototype.hasOwnProperty.call(SPEC_MAP, specializationQuery);

	const fallbackSpecializationSlug =
		question.questionSpecializations?.[0] &&
		getSpecializationSlugById(question.questionSpecializations[0].id);

	const specializationSlug =
		(isSpecializationValid ? (specializationQuery as keyof typeof SPEC_MAP) : undefined) ??
		fallbackSpecializationSlug ??
		DEFAULT_SPECIALIZATION_SLUG;

	const questionsRoute = `/${locale}/questions/${specializationSlug}`;

	return <QuestionPageComponent question={question} questionsRoute={questionsRoute} />;
};

export default QuestionPage;
