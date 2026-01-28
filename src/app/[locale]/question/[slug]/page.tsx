import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { QuestionSlug, getQuestionBySlug, getQuestionSlugs } from '@/entities/question';
import { QuestionPage as QuestionPageComponent } from '@/pages/QuestionPage';
import { Translation, i18Namespace, locales } from '@/shared/config';

interface PageProps {
	params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug, locale } = await params;
	const t = await getTranslations({ locale, namespace: i18Namespace.translation });
	const question = await getQuestionBySlug(slug).catch(() => null);

	if (!question) {
		return {
			title: t(Translation.ERROR_404_TITLE),
		};
	}

	const description =
		question.description || question.shortAnswer?.slice(0, 160).replace(/<[^>]*>/g, '') || '';

	return {
		title: question.title,
		description,
		keywords: question.keywords,
		openGraph: {
			title: question.title,
			description,
			type: 'article',
			images: question.imageSrc ? [question.imageSrc] : [],
		},
	};
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
			allSlugs.map(({ slug }) => ({
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
