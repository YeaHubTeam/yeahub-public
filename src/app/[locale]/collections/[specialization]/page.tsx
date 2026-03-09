import { notFound } from 'next/navigation';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { GetCollectionsListParamsRequest, getCollectionsList } from '@/entities/collection';
import {
	getSpecializationBySlug,
	getSpecializationSlugs,
	getSpecializations,
} from '@/entities/specialization';
import { CollectionsPage } from '@/pages/CollectionsPage';
import { i18Namespace, locales } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';
import { QUESTIONS_PER_PAGE } from '@/shared/libs';

interface PageProps {
	params: Promise<{ locale: string; specialization: string }>;
	searchParams: Promise<GetCollectionsListParamsRequest>;
}

export const dynamic = 'auto';

export const generateStaticParams = async () => {
	try {
		const { data: specializations } = await getSpecializationSlugs();

		return locales.flatMap((locale) =>
			specializations.map((spec) => ({
				locale,
				specialization: spec.slug,
			})),
		);
	} catch (error) {
		console.error(error);
		return [];
	}
};

const MainCollectionsPage = async ({ params, searchParams }: PageProps) => {
	const { locale, specialization } = await params;
	const { titleOrDescriptionSearch, isFree, page = '1' } = await searchParams;

	const pageNum = Number(page);

	const currentSpecialization = await getSpecializationBySlug(specialization).catch(() => null);

	if (!currentSpecialization) notFound();

	const specializationId = currentSpecialization.id;

	setRequestLocale(locale);

	const t = await getTranslations({ locale, namespace: i18Namespace.collection });

	const qs = new URLSearchParams();
	qs.set('page', pageNum.toString());
	qs.set('specialization', specializationId.toString());
	qs.set('limit', QUESTIONS_PER_PAGE.toString());
	if (titleOrDescriptionSearch) qs.set('titleOrDescriptionSearch', titleOrDescriptionSearch);
	if (isFree) qs.set('isFree', isFree.toString());

	const [collectionsResponse, specializationsResponse] = await Promise.all([
		getCollectionsList({
			page: pageNum,
			limit: QUESTIONS_PER_PAGE,
			specializations: specializationId,
			titleOrDescriptionSearch,
			isFree,
		}),
		getSpecializations({ limit: 5 }),
	]);

	const hasFilters = !!isFree || !!titleOrDescriptionSearch;

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/collections/${specialization}`;
	const collectionsTitle = t('collections.title');

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'CollectionPage',
				'@id': pageUrl,
				url: pageUrl,
				name: `${collectionsTitle} — ${currentSpecialization.title}`,
				description:
					currentSpecialization.description ||
					`${collectionsTitle} — ${currentSpecialization.title}`,
				isPartOf: {
					'@type': 'WebSite',
					url: siteUrl,
					name: 'YeaHub',
				},
				mainEntity: {
					'@type': 'ItemList',
					numberOfItems: collectionsResponse.total,
					itemListElement: collectionsResponse.data?.map((c, index) => ({
						'@type': 'ListItem',
						position: index + 1 + (pageNum - 1) * QUESTIONS_PER_PAGE,
						url: `${siteUrl}/${locale}/collections/${specialization}/${c.slug}`,
						name: c.title,
						description: c.description?.slice(0, 200),
					})),
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
						name: `${collectionsTitle} — ${currentSpecialization.title}`,
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
			<CollectionsPage
				locale={locale}
				page={pageNum}
				collections={collectionsResponse?.data || []}
				total={collectionsResponse?.total || 0}
				limit={collectionsResponse?.limit || 0}
				specialization={specialization}
				initialSpecializations={specializationsResponse}
				hasFilters={hasFilters}
				currentSpecialization={currentSpecialization}
			/>
		</>
	);
};

export default MainCollectionsPage;
