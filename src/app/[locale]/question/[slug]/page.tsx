import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import { QuestionSlug, getQuestionBySlug, getQuestionSlugs } from '@/entities/question';
import { QuestionPage as QuestionPageComponent } from '@/pages/QuestionPage';
import { locales } from '@/shared/config';

interface PageProps {
	params: Promise<{ locale: string; slug: string }>;
}

export const generateStaticParams = async () => {
	try {
		const BATCH_SIZE = 100;

		const firstPage = await getQuestionSlugs({ page: 1, limit: BATCH_SIZE });

		const { data: initialData, total } = firstPage;
		let allSlugs: QuestionSlug[] = [...initialData];

		const totalPages = Math.ceil(total / BATCH_SIZE);

		if (totalPages > 1) {
			const promises = [];

			for (let page = 2; page <= totalPages; page++) {
				promises.push(getQuestionSlugs({ page, limit: BATCH_SIZE }));
			}

			const results = await Promise.all(promises);

			results.forEach((response) => {
				allSlugs = [...allSlugs, ...response.data];
			});
		}

		return locales.flatMap((locale) =>
			firstPage.data.map(({ slug }) => ({
				locale,
				slug,
			})),
		);
	} catch (error) {
		console.error('generateStaticParams error:', error);
		return [];
	}
};

export const dynamic = 'force-static';

const QuestionPage = async ({ params }: PageProps) => {
	const { locale, slug } = await params;

	setRequestLocale(locale);

	const question = await getQuestionBySlug(slug);

	if (!question) {
		notFound();
	}

	return <QuestionPageComponent question={question} />;
};

export default QuestionPage;
