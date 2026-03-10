import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { socialMediaLinks } from '@/entities/socialMedia';
import { MediaPage as MediaPageComponent } from '@/pages/MediaPage';
import { Media, i18Namespace } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.media });

	const title = t(Media.INTRODUCTION_TITLE);
	const description = t(Media.INTRODUCTION_DESCRIPTION);
	const keywords = [
		title,
		t(Media.CHANNELS_TITLE),
		t(Media.EXPERTS_TITLE),
		...socialMediaLinks.map((media) => media.title),
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

const MediaPage = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.media });

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/media`;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebPage',
				'@id': pageUrl,
				url: pageUrl,
				name: t(Media.INTRODUCTION_TITLE),
				description: t(Media.INTRODUCTION_DESCRIPTION),
				isPartOf: {
					'@type': 'WebSite',
					url: siteUrl,
					name: 'YeaHub',
				},
			},
			{
				'@type': 'TelegramChannels',
				name: 'YeaHub',
				url: siteUrl,
				description: t(Media.TELEGRAM_DESCRIPTION),
				hasCredential: socialMediaLinks.map((media) => media.title),
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
						name: t(Media.INTRODUCTION_TITLE),
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
			<MediaPageComponent locale={locale} />
		</>
	);
};

export default MediaPage;
