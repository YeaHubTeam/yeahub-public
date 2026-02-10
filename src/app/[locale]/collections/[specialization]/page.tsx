import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import { GetCollectionsListParamsRequest, getCollectionsList } from '@/entities/collection';
import { getSpecializationSlugs } from '@/entities/specialization';
import { CollectionsPage } from '@/pages/CollectionsPage';
import { locales } from '@/shared/config';
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

	const { data: specializationsSlugs } = await getSpecializationSlugs();
	const currentSpec = specializationsSlugs.find((s) => s.slug === specialization);

	if (!currentSpec) notFound();

	const specializationId = currentSpec.id;

	setRequestLocale(locale);

	const qs = new URLSearchParams();
	qs.set('page', pageNum.toString());
	qs.set('specialization', specializationId.toString());
	qs.set('limit', QUESTIONS_PER_PAGE.toString());
	if (titleOrDescriptionSearch) qs.set('titleOrDescriptionSearch', titleOrDescriptionSearch);
	if (isFree) qs.set('isFree', isFree.toString());

	const response = await getCollectionsList({
		page: pageNum,
		limit: QUESTIONS_PER_PAGE,
		specializationId,
		titleOrDescriptionSearch,
		isFree,
	});

	const hasFilters = !!isFree || !!titleOrDescriptionSearch;

	return (
		<CollectionsPage
			locale={locale}
			page={pageNum}
			collections={response?.data || []}
			total={response?.total || 0}
			limit={response?.limit || 0}
			specialization={specialization}
			hasFilters={hasFilters}
			specializationSlugs={specializationsSlugs}
		/>
	);
};

export default MainCollectionsPage;
