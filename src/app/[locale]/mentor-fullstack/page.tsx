import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { MentorFullstackPage } from '@/pages/MentorFullstackPage';
import { MentorFullstack, i18Namespace } from '@/shared/config';

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.mentorFullstack });
	const title = t(MentorFullstack.SEO_TITLE);
	const description = t(MentorFullstack.SEO_DESCRIPTION);

	return {
		title,
		description,
	};
}

const Page = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);

	return <MentorFullstackPage />;
};

export default Page;
