import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { DocsPage as DocsPageComponent } from '@/pages/DocsPage';
import { Docs, i18Namespace } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.docs });

	const title = t(Docs.TITLE);
	const description = t(Docs.TITLE);
	const keywords = [title, t(Docs.LINK)];

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

const DocsPage = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.docs });

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/docs`;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebPage',
				'@id': pageUrl,
				url: pageUrl,
				name: t(Docs.TITLE),
				description: t(Docs.TITLE),
				isPartOf: {
					'@type': 'WebSite',
					url: siteUrl,
					name: 'YeaHub',
				},
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
						name: t(Docs.TITLE),
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
			<DocsPageComponent locale={locale} />
		</>
	);
};

export default DocsPage;
