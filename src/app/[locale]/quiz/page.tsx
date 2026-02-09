import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { CreateQuizPage } from '@/pages/CreateQuizPage';
import { InterviewQuizCreate, i18Namespace } from '@/shared/config';
import { locales } from '@/shared/config';
import { SPEC_MAP } from '@/shared/libs';

interface PageProps {
	params: Promise<{ locale: string; specialization: keyof typeof SPEC_MAP }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.interviewQuizCreate });

	const title = t(InterviewQuizCreate.TITLE);
	const description = `${t(InterviewQuizCreate.MODE_SELECT)}. ${t(InterviewQuizCreate.MODE_NEW)}, ${t(InterviewQuizCreate.MODE_REPEAT)}, ${t(InterviewQuizCreate.MODE_RANDOM)}.`;
	const keywords = [
		title,
		t(InterviewQuizCreate.MODE_NEW),
		t(InterviewQuizCreate.MODE_REPEAT),
		t(InterviewQuizCreate.MODE_RANDOM),
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

export const dynamic = 'auto';

export const generateStaticParams = () => {
	return locales.flatMap((locale) =>
		Object.keys(SPEC_MAP).map((specSlug) => ({
			locale,
			specialization: specSlug,
		})),
	);
};

const MainCreateQuizPage = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);

	return <CreateQuizPage locale={locale} />;
};

export default MainCreateQuizPage;
