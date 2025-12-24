import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import { CreateQuizPage } from '@/pages/CreateQuizPage';
import { locales } from '@/shared/config';
import { SPEC_MAP } from '@/shared/libs';

interface PageProps {
	params: Promise<{ locale: string; specialization: keyof typeof SPEC_MAP }>;
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
	const { locale, specialization } = await params;

	const specializationId = SPEC_MAP[specialization];
	if (!specializationId) notFound();

	setRequestLocale(locale);

	return <CreateQuizPage locale={locale} />;
};

export default MainCreateQuizPage;
