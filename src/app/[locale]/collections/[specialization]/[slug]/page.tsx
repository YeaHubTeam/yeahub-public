import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

import { getCollectionBySlug, getCollectionsList } from '@/entities/collection';
import { getCollectionQuestions } from '@/entities/question';
import { getSpecializationSlugs } from '@/entities/specialization';
import { CollectionPage as CollectionPageComponent } from '@/pages/CollectionPage';
import { Translation, i18Namespace } from '@/shared/config';
import { locales } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';
import { DEFAULT_SPECIALIZATION_SLUG } from '@/shared/libs';

interface PageProps {
	params: Promise<{ locale: string; specialization: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug, locale } = await params;
	const t = await getTranslations({ locale, namespace: i18Namespace.translation });
	const collection = await getCollectionBySlug(slug).catch(() => null);

	if (!collection) {
		return { title: t(Translation.ERROR_404_TITLE) };
	}

	const title =
		locale === 'en'
			? `${collection.title} interview, questions and answers`
			: `Собеседование ${collection.title} - вопросы и ответы`;

	const description = collection.description?.slice(0, 160) || collection.title || '';

	return {
		title,
		description,
		keywords: collection.keywords,
		openGraph: {
			title,
			description,
			type: 'article',
			images: collection.imageSrc ? [collection.imageSrc] : [],
		},
	};
}

export const generateStaticParams = async () => {
	try {
		const { data: specializations } = await getSpecializationSlugs();
		const allParams: { locale: string; specialization: string; slug: string }[] = [];
		const BATCH_SIZE = 50;

		for (const spec of specializations) {
			try {
				const firstPage = await getCollectionsList({
					specializations: spec.id,
					page: 1,
					limit: BATCH_SIZE,
				});

				const { data: initialData, total } = firstPage;
				const specCollections = initialData.map((c) => c.slug);

				const totalPages = Math.ceil(total / BATCH_SIZE);

				if (totalPages > 1) {
					for (let page = 2; page <= totalPages; page++) {
						const response = await getCollectionsList({
							specializations: spec.id,
							page,
							limit: BATCH_SIZE,
						});
						specCollections.push(...response.data.map((c) => c.slug));
					}
				}

				specCollections.forEach((cSlug) => {
					locales.forEach((locale) => {
						allParams.push({
							locale,
							specialization: spec.slug,
							slug: cSlug,
						});
					});
				});
			} catch (error) {
				console.error(`Error fetching collections for specialization ${spec.slug}:`, error);
			}
		}

		return allParams;
	} catch (error) {
		console.error('generateStaticParams error:', error);
		return [];
	}
};

export const dynamic = 'force-static';

const CollectionPage = async ({ params }: PageProps) => {
	const { locale, slug, specialization } = await params;

	setRequestLocale(locale);

	const collection = await getCollectionBySlug(slug);
	const questions = await getCollectionQuestions(collection.id, 5);

	if (!collection) {
		notFound();
	}

	const siteUrl = process.env.NEXT_PUBLIC_APP_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/collections/${specialization}/${slug}`;

	const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'CollectionPage',
				'@id': pageUrl,
				url: pageUrl,
				name: collection.title,
				description: collection.description?.slice(0, 300) || collection.title,
				image: collection.imageSrc || undefined,
				dateCreated: collection.createdAt,
				dateModified: collection.updatedAt,
				isPartOf: {
					'@type': 'WebSite',
					url: siteUrl,
					name: 'YeaHub',
				},
				mainEntity: {
					'@type': 'ItemList',
					numberOfItems: collection.questionsCount || collection.questions?.length || 0,
					itemListElement: collection.questions?.map((q, index) => ({
						'@type': 'ListItem',
						position: index + 1,
						url: `${siteUrl}/${locale}/questions/${specialization}/${q.slug}`,
						name: q.title,
						description: stripHtml(q.shortAnswer).slice(0, 200),
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
						name: collection.specializations?.[0]?.title || specialization,
						item: `${siteUrl}/${locale}/collections/${specialization}`,
					},
					{
						'@type': 'ListItem',
						position: 3,
						name: collection.title,
						item: pageUrl,
					},
				],
			},
		],
	};

	collection.questions = questions.data;

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<CollectionPageComponent
				collection={collection}
				specialization={specialization ?? DEFAULT_SPECIALIZATION_SLUG}
				locale={locale}
			/>
		</>
	);
};

export default CollectionPage;
