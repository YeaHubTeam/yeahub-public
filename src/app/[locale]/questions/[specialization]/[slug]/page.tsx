import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getQuestionBySlug, getQuestionsList } from '@/entities/question';
import { getSpecializationSlugs } from '@/entities/specialization';
import { QuestionPage as QuestionPageComponent } from '@/pages/QuestionPage';
import { Translation, i18Namespace, locales } from '@/shared/config';

interface PageProps {
	params: Promise<{ locale: string; specialization: string; slug: string }>;
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
		const { data: specializations } = await getSpecializationSlugs();
		const allParams: { locale: string; specialization: string; slug: string }[] = [];
		const BATCH_SIZE = 50;

		for (const spec of specializations) {
			try {
				const firstPage = await getQuestionsList({
					specializationId: spec.id,
					page: 1,
					limit: BATCH_SIZE,
				});

				const { data: initialData, total } = firstPage;
				const specQuestions = initialData.map((q) => q.slug);

				const totalPages = Math.ceil(total / BATCH_SIZE);

				if (totalPages > 1) {
					for (let page = 2; page <= totalPages; page++) {
						const response = await getQuestionsList({
							specializationId: spec.id,
							page,
							limit: BATCH_SIZE,
						});
						specQuestions.push(...response.data.map((q) => q.slug));
					}
				}

				specQuestions.forEach((qSlug) => {
					locales.forEach((locale) => {
						allParams.push({
							locale,
							specialization: spec.slug,
							slug: qSlug,
						});
					});
				});
			} catch (error) {
				console.error(`Error fetching questions for specialization ${spec.slug}:`, error);
			}
		}

		return allParams;
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
