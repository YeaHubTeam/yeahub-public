import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

import { getCollectionBySlug, getCollectionsList } from '@/entities/collection';
import { getSpecializationSlugs } from '@/entities/specialization';
import { CollectionPage as CollectionPageComponent } from '@/pages/CollectionPage';
import { Translation, i18Namespace } from '@/shared/config';
import { locales } from '@/shared/config';
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

	const description = collection.description?.slice(0, 160) || collection.title || '';

	return {
		title: collection.title,
		description,
		keywords: collection.keywords,
		openGraph: {
			title: collection.title,
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
		const BATCH_SIZE = 100;

		for (const spec of specializations) {
			try {
				const firstPage = await getCollectionsList({
					specializationId: spec.id,
					page: 1,
					limit: BATCH_SIZE,
				});

				const { data: initialData, total } = firstPage;
				const specCollections = initialData.map((c) => c.slug);

				const totalPages = Math.ceil(total / BATCH_SIZE);

				if (totalPages > 1) {
					for (let page = 2; page <= totalPages; page++) {
						const response = await getCollectionsList({
							specializationId: spec.id,
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

	if (!collection) {
		notFound();
	}

	return (
		<CollectionPageComponent
			collection={collection}
			specialization={specialization ?? DEFAULT_SPECIALIZATION_SLUG}
		/>
	);
};

export default CollectionPage;
