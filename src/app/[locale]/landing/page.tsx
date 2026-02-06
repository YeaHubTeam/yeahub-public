import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LandingPage as LandingPageComponent } from '@/pages/LandingPage';
import { Landing, i18Namespace } from '@/shared/config';

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.landing });

	const title = t(Landing.BANNER_TITLE);
	const description = t(Landing.BANNER_DESCRIPTION);
	const keywords = [
		t(Landing.BANNER_STICKER_SKILL),
		t(Landing.BANNER_STICKER_CANDIDATE),
		t(Landing.SPECIALIZATION_NEW_TITLE),
		t(Landing.SPECIALIZATION_BUTTON),
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

const LandingPage = () => {
	return <LandingPageComponent />;
};

export default LandingPage;
