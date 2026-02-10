import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getSpecializationSlugs } from '@/entities/specialization';
import { CreateQuizPage } from '@/pages/CreateQuizPage';
import { InterviewQuizCreate, i18Namespace } from '@/shared/config';
import { locales } from '@/shared/config';

interface PageProps {
	params: Promise<{ locale: string; specialization: string }>;
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

export const generateStaticParams = async () => {
	try {
		const { data: specializations } = await getSpecializationSlugs();

		return locales.flatMap((locale) =>
			specializations.map((spec) => ({
				locale,
				specialization: spec.slug,
			})),
		);
	} catch (error) {
		console.error(error);
		return [];
	}
};

const MainCreateQuizPage = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);

	return <CreateQuizPage locale={locale} />;
};

export default MainCreateQuizPage;
