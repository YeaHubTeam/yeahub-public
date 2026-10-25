import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { MentorWorldwidePage } from '@/pages/MentorWorldwidePage';
import { MentorWorldwide, i18Namespace, locales } from '@/shared/config';

export const dynamic = 'force-static';

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.mentorWorldwide });
	const title = t(MentorWorldwide.SEO_TITLE);
	const description = t(MentorWorldwide.SEO_DESCRIPTION);

	return {
		title,
		description,
	};
}

const Page = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);

	return <MentorWorldwidePage locale={locale} />;
};

export default Page;
