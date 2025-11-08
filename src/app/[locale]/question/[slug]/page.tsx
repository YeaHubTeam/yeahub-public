import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import { Question } from '@/entities/question';
import type { GetQuestionsListResponse } from '@/entities/question';
import { type QuestionWithSlug, attachQuestionSlugs } from '@/entities/question';
import { QuestionPage as QuestionPageComponent } from '@/pages/QuestionPage';
import { locales } from '@/shared/config';
import { DEFAULT_SPECIALIZATION_SLUG, SPEC_MAP, getSpecializationSlugById } from '@/shared/libs';

const QUESTIONS_API_URL =
	'https://api.yeahub.ru/questions/public-questions?page=1&limit=100&skillFilterMode=ANY';

interface PageProps {
	params: Promise<{ locale: string; slug: string }>;
	searchParams: Promise<{ specialization?: string }>;
}

const fetchQuestions = async () => {
	const res = await fetch(QUESTIONS_API_URL, {
		cache: 'force-cache',
	});

	if (!res.ok) {
		throw new Error('Failed to load questions', { cause: res });
	}

	const response = (await res.json()) as GetQuestionsListResponse;

	return attachQuestionSlugs(response.data);
};

export const generateStaticParams = async () => {
	try {
		const questions = await fetchQuestions();

		return locales.flatMap((locale) =>
			questions.map(({ slug }) => ({
				locale,
				slug,
			})),
		);
	} catch (error) {
		console.error('generateStaticParams: fallback to empty list', error);
		return [];
	}
};

export const dynamic = 'force-static';

const QuestionPage = async ({ params, searchParams }: PageProps) => {
	const { locale, slug } = await params;
	const { specialization: specializationQuery } = await searchParams;

	setRequestLocale(locale);

	const questions = await fetchQuestions();
	const matched = questions.find((question) => question.slug === slug);

	if (!matched) {
		notFound();
	}

	let question: QuestionWithSlug | Question = matched;

	const detailRes = await fetch(`https://api.yeahub.ru/questions/public-questions/${matched.id}`, {
		cache: 'force-cache',
	});
	if (detailRes.ok) {
		question = await detailRes.json();
	} else if (detailRes.status !== 404) {
		throw new Error('Failed to load question', { cause: detailRes });
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

	return <QuestionPageComponent question={question as Question} questionsRoute={questionsRoute} />;
};

export default QuestionPage;
