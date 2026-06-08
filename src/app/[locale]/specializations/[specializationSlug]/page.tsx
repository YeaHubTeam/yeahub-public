import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getCollectionsList } from '@/entities/collection';
import { getHhTopBySpec } from '@/entities/hh';
import { getSpecializationBySlug, getSpecializationSlugs } from '@/entities/specialization';
import { SpecializationPage as SpecializationPageComponent } from '@/pages/SpecializationPage';
import { Specializations, Translation, i18Namespace, locales } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';

interface PageProps {
	params: Promise<{ locale: string; specializationSlug: string }>;
}

export const dynamic = 'force-static';

export const generateStaticParams = async () => {
	try {
		const { data: specializations } = await getSpecializationSlugs();

		return locales.flatMap((locale) =>
			specializations.map((specialization) => ({
				locale,
				specializationSlug: specialization.slug,
			})),
		);
	} catch (error) {
		console.error(error);
		return [];
	}
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale, specializationSlug } = await params;

	setRequestLocale(locale);

	const t = await getTranslations({ locale, namespace: i18Namespace.translation });
	const specialization = await getSpecializationBySlug(specializationSlug).catch(() => null);

	if (!specialization) {
		return { title: t(Translation.ERROR_404_TITLE) };
	}

	const description = specialization.description || specialization.title;
	const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://yeahub.ru').replace(/\/$/, '');
	const canonical = `${baseUrl}/${locale}/specializations/${specializationSlug}`;

	return {
		title: specialization.title,
		description,
		alternates: {
			canonical,
		},
		openGraph: {
			title: specialization.title,
			description,
			type: 'website',
			url: canonical,
		},
	};
}

const SpecializationSlugPage = async ({ params }: PageProps) => {
	const { locale, specializationSlug } = await params;
	setRequestLocale(locale);

	const t = await getTranslations({ locale, namespace: i18Namespace.specialization });
	const specialization = await getSpecializationBySlug(specializationSlug).catch(() => null);

	if (!specialization) {
		notFound();
	}

	const collectionsResponse = await getCollectionsList({
		specializations: specialization.id,
		limit: 3,
	}).catch(() => null);
	const collections = collectionsResponse?.data ?? [];

	const specAnalytics = await getHhTopBySpec(specialization.id);

	const siteUrl = process.env.NEXT_PUBLIC_APP_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/specializations/${specializationSlug}`;
	const description = specialization.description || t(Specializations.TITLE_MAIN);

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'CollectionPage',
				'@id': pageUrl,
				url: pageUrl,
				name: specialization.title,
				description,
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
						name: t(Specializations.TITLE_MAIN),
						item: `${siteUrl}/${locale}/specializations`,
					},
					{
						'@type': 'ListItem',
						position: 3,
						name: specialization.title,
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
			<SpecializationPageComponent
				specAnalytics={specAnalytics}
				specialization={specialization}
				collections={collections}
				locale={locale}
			/>
		</>
	);
};

export default SpecializationSlugPage;
