import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getQuestionsSpecializationByIdCount } from '@/entities/question';
import { LS_ACTIVE_SPECIALIZATION_ID, getSpecializationSlugs } from '@/entities/specialization';
import { PublicQuizResultPage } from '@/pages/QuizResult';
import { InterviewQuizResult, i18Namespace, locales } from '@/shared/config';
import { getJSONFromLS } from '@/shared/libs';

interface PageProps {
	params: Promise<{ locale: string; specialization: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.interviewQuizResult });

	const title = t(InterviewQuizResult.INTERVIEW_STATISTIC_TITLE);

	return {
		title,
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

const MainResultQuizPage = async ({ params }: PageProps) => {
	const { locale } = await params;
	setRequestLocale(locale);

	// specialization здесь — это slug, нужно получить id специализации
	// если specializationId передаётся как параметр маршрута напрямую,
	// замени specialization на нужный id
	const specializationId = getJSONFromLS(LS_ACTIVE_SPECIALIZATION_ID);
	const quizResults = await getQuestionsSpecializationByIdCount(specializationId);

	return <PublicQuizResultPage quizResults={quizResults} />;
};

export default MainResultQuizPage;
