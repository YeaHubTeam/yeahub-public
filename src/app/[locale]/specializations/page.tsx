import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getSpecializations } from '@/entities/specialization';
import { SpecializationsPage } from '@/pages/SpecializationsPage';
import { Specializations, i18Namespace } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.specialization });

	const title = t(Specializations.SEO_MAIN_PAGE_TITLE);
	const description = t(Specializations.SEO_MAIN_PAGE_DESCRIPTION);
	const keywords = [title, t(Specializations.SEO_MAIN_PAGE_KEYWORDS)];

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

const MainSpecializationsPage = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.specialization });

	const specializations = await getSpecializations({ limit: 100 });

	const siteUrl = process.env.NEXT_PUBLIC_APP_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/specializations`;

	const title = t(Specializations.TITLE_MAIN);
	const description = t(Specializations.TITLE_PAGE);

	const itemListElement = (specializations.data || []).map((specialization, index) => ({
		'@type': 'ListItem' as const,
		position: index + 1,
		name: specialization.title,
	}));

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'CollectionPage',
				'@id': pageUrl,
				url: pageUrl,
				name: title,
				description,
				isPartOf: {
					'@type': 'WebSite',
					url: siteUrl,
					name: 'YeaHub',
				},
				mainEntity: {
					'@type': 'ItemList',
					itemListElement,
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
						name: title,
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
			<SpecializationsPage specializations={specializations} locale={locale} />
		</>
	);
};

export default MainSpecializationsPage;
