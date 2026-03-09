import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AvosPage as AvosPageComponent } from '@/pages/AvosPage';
import { Avos, i18Namespace } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';
import { avosAndYeahubLogo } from '@/widgets/Avos';

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.avos });

	const title = t(Avos.AVOS_TITLE);
	const description = t(Avos.AVOS_SUBTITLE);
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

const AvosPage = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.avos });

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/avos`;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebPage',
				'@id': pageUrl,
				url: pageUrl,
				name: t(Avos.AVOS_TITLE),
				description: t(Avos.AVOS_SUBTITLE),
				isPartOf: {
					'@type': 'WebSite',
					url: siteUrl,
					name: 'YeaHub',
				},
			},
			{
				'@type': 'Product',
				name: t(Avos.AVOS_PROMO_ABOUT),
				description: t(Avos.AVOS_INTERVIEWS),
				image: avosAndYeahubLogo ? avosAndYeahubLogo.src : undefined,
				offers: {
					'@type': 'Offer',
					price: '1500',
					priceCurrency: 'RUB',
					availability: 'https://schema.org/InStock',
					name: t(Avos.AVOS_PROMO_JOIN_PRICE),
				},
				category: [
					t(Avos.AVOS_PROMO_CHIPS_REVIEWS),
					t(Avos.AVOS_PROMO_CHIPS_RECORDINGS),
					t(Avos.AVOS_PROMO_CHIPS_BREAKDOWNS),
					t(Avos.AVOS_PROMO_CHIPS_INTERVIEW),
					t(Avos.AVOS_PROMO_CHIPS_GUIDES),
				],
			},
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						name: 'YeaHub',
						item: siteUrl,
					},
					{
						'@type': 'ListItem',
						position: 2,
						name: t(Avos.AVOS_TITLE),
						item: pageUrl,
					},
				],
			},
		],
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<AvosPageComponent />
		</>
	);
};

export default AvosPage;
