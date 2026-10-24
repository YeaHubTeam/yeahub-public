import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { MentorFullstackPage } from '@/pages/MentorFullstackPage';
import { Header, i18Namespace } from '@/shared/config';

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.header });
	const title = t(Header.NAV_FULLSTACK);

	return {
		title,
		description: title,
	};
}

const Page = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);

	return <MentorFullstackPage />;
};

export default Page;
