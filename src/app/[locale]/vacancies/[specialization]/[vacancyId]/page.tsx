import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getCollectionsList } from '@/entities/collection';
import { getSpecializationById } from '@/entities/specialization';
import { getVacancyById } from '@/entities/vacancy';
import { VacancyPage } from '@/pages/VacancyPage';
import { Translation, Vacancies, i18Namespace } from '@/shared/config';

export const dynamic = 'auto';

interface PageProps {
	params: Promise<{ locale: string; vacancyId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale, vacancyId } = await params;
	setRequestLocale(locale);

	const t = await getTranslations({ locale, namespace: i18Namespace.vacancies });
	const tTranslation = await getTranslations({ locale, namespace: i18Namespace.translation });
	const vacancy = await getVacancyById(vacancyId).catch(() => null);

	if (!vacancy) return { title: tTranslation(Translation.ERROR_404_TITLE) };

	const title = vacancy.title || t(Vacancies.DETAIL_PAGE_TITLE);
	const description =
		vacancy?.description?.replace(/<[^>]*>/g, '').slice(0, 160) ||
		t(Vacancies.DETAIL_PAGE_DESCRIPTION);

	const baseKeywords = t(Vacancies.DETAIL_PAGE_KEYWORDS);
	const additionalKeywords = [
		vacancy?.title,
		vacancy?.company?.title,
		...(vacancy?.skills?.map((skill) => skill.title) || []),
		...(vacancy?.workFormat || []),
		vacancy?.grade,
		vacancy?.employmentForm,
	]
		.filter(Boolean)
		.join(', ');

	const keywords = `${baseKeywords}, ${additionalKeywords}`;

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

const VacancyDetailPage = async ({ params }: PageProps) => {
	const { locale, vacancyId } = await params;

	setRequestLocale(locale);

	const vacancy = await getVacancyById(vacancyId).catch(() => null);

	if (!vacancy) {
		notFound();
	}
	const companyId = vacancy?.company.id ?? '';

	const [collectionsResponse, specialization] = await Promise.all([
		getCollectionsList({ companies: companyId, limit: 3 }),
		getSpecializationById(vacancy.specializationId),
	]);

	return (
		<VacancyPage
			locale={locale}
			vacancy={vacancy}
			collections={collectionsResponse?.data ?? null}
			specializationSlug={specialization?.slug}
		/>
	);
};

export default VacancyDetailPage;
