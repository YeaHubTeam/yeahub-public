import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AvosPage as AvosPageComponent } from '@/pages/AvosPage';
import { Avos, i18Namespace } from '@/shared/config';
import { avosAndYeahubLogo } from '@/widgets/Avos';

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.avos });

	const title = t(Avos.AVOS_TITLE);
	const description = t(Avos.AVOS_SUBTITLE); // можно заменить на t(Avos.AVOS_INTERVIEWS) или склеить оба
	const keywords = [
		t(Avos.AVOS_PROMO_CHIPS_REVIEWS),
		t(Avos.AVOS_PROMO_CHIPS_RECORDINGS),
		t(Avos.AVOS_PROMO_CHIPS_BREAKDOWNS),
		t(Avos.AVOS_PROMO_CHIPS_INTERVIEW),
		t(Avos.AVOS_PROMO_CHIPS_GUIDES),
	];

	return {
		title,
		description,
		keywords,
		openGraph: {
			title,
			description,
			type: 'website',
			images: avosAndYeahubLogo ? [{ url: avosAndYeahubLogo.src }] : [],
		},
	};
}

const AvosPage = () => {
	return <AvosPageComponent />;
};

export default AvosPage;
