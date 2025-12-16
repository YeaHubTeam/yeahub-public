import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import {
	getCollectionById,
	getCollectionQuestions,
	getCollectionsList,
} from '@/entities/collection';
import { CollectionPage as CollectionPageComponent } from '@/pages/CollectionPage';
import { locales } from '@/shared/config';
import {
	COUNT_TO_GET_COLLECTIONS_FOR_SSG,
	DEFAULT_SPECIALIZATION_SLUG,
	SPEC_MAP,
} from '@/shared/libs';

interface PageProps {
	params: Promise<{ locale: string; id: string }>;
	searchParams: Promise<{ specialization: keyof typeof SPEC_MAP }>;
}

export const generateStaticParams = async () => {
	try {
		const { data } = await getCollectionsList({
			page: 1,
			limit: COUNT_TO_GET_COLLECTIONS_FOR_SSG,
		});

		return locales.flatMap((locale) =>
			data.map(({ id }) => ({
				locale,
				id: id.toString(),
			})),
		);
	} catch (error) {
		console.error('generateStaticParams: fallback to empty list', error);
		return [];
	}
};

export const dynamic = 'force-static';

const CollectionPage = async ({ params, searchParams }: PageProps) => {
	const { locale, id } = await params;
	const { specialization } = await searchParams;

	setRequestLocale(locale);

	const collectionId = Number(id);
	if (isNaN(collectionId)) {
		notFound();
	}

	const collection = await getCollectionById(collectionId);

	if (!collection) {
		notFound();
	}

	const questions = await getCollectionQuestions(collectionId, collection.questionsCount || 0);

	collection.questions = questions?.data || [];

	return (
		<CollectionPageComponent
			collection={collection}
			specialization={specialization ?? DEFAULT_SPECIALIZATION_SLUG}
		/>
	);
};

export default CollectionPage;
