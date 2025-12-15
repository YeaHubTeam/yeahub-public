import { notFound } from 'next/navigation';

import { setRequestLocale } from 'next-intl/server';

import { GetCollectionsListParamsRequest, getCollectionsList } from '@/entities/collection';
import { CollectionsPage } from '@/pages/CollectionsPage';
import { locales } from '@/shared/config';
import { SPEC_MAP } from '@/shared/libs';
import { QUESTIONS_PER_PAGE } from '@/shared/libs';

interface PageProps {
	params: Promise<{ locale: string; specialization: keyof typeof SPEC_MAP }>;
	searchParams: Promise<GetCollectionsListParamsRequest>;
}

export const dynamic = 'auto';

export const generateStaticParams = () => {
	return locales.flatMap((locale) =>
		Object.keys(SPEC_MAP).map((specSlug) => ({
			locale,
			specialization: specSlug,
		})),
	);
};

const MainCollectionsPage = async ({ params, searchParams }: PageProps) => {
	const { locale, specialization } = await params;
	const { titleOrDescriptionSearch, isFree, page = '1' } = await searchParams;

	const pageNum = Number(page);

	const specializationId = SPEC_MAP[specialization];
	if (!specializationId) notFound();

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
		specializations: specializationId,
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
		/>
	);
};

export default MainCollectionsPage;
