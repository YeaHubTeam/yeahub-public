import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getAllPublicTestQuestions, getPublicTestQuestionById } from '@/entities/testQuestion';
import { TestQuestionPage as TestQuestionPageComponent } from '@/pages/TestQuestionPage';
import { ROUTES, SITE_URL, Translation, i18Namespace, locales } from '@/shared/config';
import { route } from '@/shared/libs';

interface PageProps {
	params: Promise<{ locale: string; testQuestionId: string }>;
}

export const dynamic = 'force-static';

export async function generateStaticParams() {
	const questions = await getAllPublicTestQuestions();
	return locales.flatMap((locale) =>
		questions.map((question) => ({ locale, testQuestionId: String(question.id) })),
	);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale, testQuestionId } = await params;
	const question = await getPublicTestQuestionById(testQuestionId);

	if (!question) {
		const t = await getTranslations({ locale, namespace: i18Namespace.translation });
		return { title: t(Translation.ERROR_404_TITLE), robots: { index: false, follow: false } };
	}

	const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/$/, '');
	const canonical = `${siteUrl}/${locale}${route(ROUTES.testQuestions.detail.page, question.id)}`;
	const description = (question.description || question.title)
		.replace(/<[^>]*>/g, '')
		.slice(0, 160);

	return {
		title: question.title,
		description,
		keywords: question.keywords ?? [],
		alternates: { canonical },
		openGraph: {
			title: question.title,
			description,
			type: 'article',
			url: canonical,
			images: question.imageSrc ? [question.imageSrc] : [],
		},
	};
}

const TestQuestionPage = async ({ params }: PageProps) => {
	const { locale, testQuestionId } = await params;
	setRequestLocale(locale);

	const question = await getPublicTestQuestionById(testQuestionId);
	if (!question) {
		notFound();
	}

	return <TestQuestionPageComponent question={question} />;
};

export default TestQuestionPage;
