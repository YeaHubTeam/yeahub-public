import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import {
	type GetVacanciesListParamsRequest,
	MAX_SHOW_LIMIT_VACANCIES,
	getVacancies,
} from '@/entities/vacancy';
import { VacanciesPage as VacanciesPageComponent } from '@/pages/VacanciesPage';
import { Vacancies, i18Namespace } from '@/shared/config';

export const dynamic = 'force-dynamic';

interface PageProps {
	params: Promise<{ locale: string }>;
	searchParams: Promise<GetVacanciesListParamsRequest>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.vacancies });

	const title = t(Vacancies.LIST_PAGE_TITLE);
	const description = t(Vacancies.LIST_PAGE_DESCRIPTION);
	const keywords = t(Vacancies.LIST_PAGE_KEYWORDS);

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

const MainVacanciesPage = async ({ searchParams }: PageProps) => {
	const { page = '1' } = await searchParams;

	const pageNum = Number(page);

	const vacancies = await getVacancies({ page: pageNum, limit: MAX_SHOW_LIMIT_VACANCIES });

	return (
		<>
			<VacanciesPageComponent
				vacancies={vacancies?.data || []}
				total={vacancies?.total || 0}
				limit={vacancies?.limit || 0}
				page={pageNum}
			/>
		</>
	);
};

export default MainVacanciesPage;
