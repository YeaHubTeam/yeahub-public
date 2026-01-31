import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import { getCollectionBySlug, getCollectionSlugs } from '@/entities/collection';
import type { CollectionSlug } from '@/entities/collection';
import { CollectionPage as CollectionPageComponent } from '@/pages/CollectionPage';
import { locales } from '@/shared/config';
import { DEFAULT_SPECIALIZATION_SLUG, SPEC_MAP } from '@/shared/libs';

interface PageProps {
	params: Promise<{ locale: string; slug: string }>;
	searchParams: Promise<{ specialization: keyof typeof SPEC_MAP }>;
}

export const generateStaticParams = async () => {
	try {
		const BATCH_SIZE = 100;

		const firstPage = await getCollectionSlugs({ page: 1, limit: BATCH_SIZE });

		const { data: initialData, total } = firstPage;
		let allSlugs: CollectionSlug[] = [...initialData];

		const totalPages = Math.ceil(total / BATCH_SIZE);

		if (totalPages > 1) {
			const promises = [];

			for (let page = 2; page <= totalPages; page++) {
				promises.push(getCollectionSlugs({ page, limit: BATCH_SIZE }));
			}

			const results = await Promise.all(promises);

			results.forEach((response) => {
				allSlugs = [...allSlugs, ...response.data];
			});
		}

		return locales.flatMap((locale) =>
			allSlugs.map(({ slug }) => ({
				locale,
				slug,
			})),
		);
	} catch (error) {
		console.error('generateStaticParams error:', error);
		return [];
	}
};

export const dynamic = 'force-static';

const CollectionPage = async ({ params, searchParams }: PageProps) => {
	const { locale, slug } = await params;
	const { specialization } = await searchParams;

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
