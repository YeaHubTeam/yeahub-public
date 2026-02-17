import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { type GetResourcesListParamsRequest, getResourcesList } from '@/entities/resource';
import { getSpecializationBySlug, getSpecializationSlugs } from '@/entities/specialization';
import { ResourcesPage } from '@/pages/ResourcesPage';
import { Resources, i18Namespace } from '@/shared/config';
import { locales } from '@/shared/config';
import { RESOURCES_PER_PAGE } from '@/shared/libs';

interface PageProps {
	params: Promise<{ locale: string; specialization: string }>;
	searchParams: Promise<GetResourcesListParamsRequest>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.resources });

	const title = t(Resources.HEADER_TITLE);
	const description = t(Resources.HEADER_TITLE);
	const keywords = [t(Resources.HEADER_TITLE), t(Resources.RESOURCES_TITLE)];

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

const RESOURCE_TYPE_SCHEMA_MAP: Record<string, string> = {
	video: 'VideoObject',
	podcast: 'PodcastEpisode',
	course: 'Course',
	article: 'Article',
	book: 'Book',
	guide: 'HowTo',
	documentation: 'TechArticle',
};

const MainResourcesPage = async ({ params, searchParams }: PageProps) => {
	const { locale, specialization } = await params;
	const { types, name, skills, page = '1' } = await searchParams;

	const pageNum = Number(page);

	const currentSpec = await getSpecializationBySlug(specialization).catch(() => null);

	if (!currentSpec) notFound();

	const specializationId = currentSpec.id;

	setRequestLocale(locale);

	const t = await getTranslations({ locale, namespace: i18Namespace.resources });

	const response = await getResourcesList({
		page: pageNum,
		limit: RESOURCES_PER_PAGE,
		specializations: specializationId,
		skills,
		types,
		name,
	});

	const hasFilters = !!name || !!types || !!skills;

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yeatwork.ru';
	const pageUrl = `${siteUrl}/${locale}/resources/${specialization}`;
	const headerTitle = t(Resources.HEADER_TITLE);

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'CollectionPage',
				'@id': pageUrl,
				url: pageUrl,
				name: `${headerTitle} — ${currentSpec.title}`,
				description: currentSpec.description || `${headerTitle} — ${currentSpec.title}`,
				isPartOf: {
					'@type': 'WebSite',
					url: siteUrl,
					name: 'YeaHub',
				},
				mainEntity: {
					'@type': 'ItemList',
					numberOfItems: response.total,
					itemListElement: response.data?.map((resource, index) => ({
						'@type': 'ListItem',
						position: index + 1 + (pageNum - 1) * RESOURCES_PER_PAGE,
						url: resource.url,
						name: resource.name,
						item: {
							'@type': RESOURCE_TYPE_SCHEMA_MAP[resource.type.code] || 'LearningResource',
							name: resource.name,
							description: resource.description?.slice(0, 300),
							url: resource.url,
							image: resource.imageSrc || undefined,
							keywords: resource.keywords,
							dateCreated: resource.createdAt,
							dateModified: resource.updatedAt,
						},
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
						name: `${headerTitle} — ${currentSpec.title}`,
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
			<ResourcesPage
				locale={locale}
				page={pageNum}
				resources={response?.data || []}
				total={response?.total || 0}
				limit={response?.limit || 0}
				hasFilters={hasFilters}
				currentSpec={currentSpec}
			/>
		</>
	);
};

export default MainResourcesPage;
