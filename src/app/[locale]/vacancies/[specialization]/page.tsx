import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getSkills } from '@/entities/skill';
import { getSpecializationBySlug, getSpecializations } from '@/entities/specialization';
import {
	type GetVacanciesListParamsRequest,
	MAX_SHOW_LIMIT_VACANCIES,
	getVacancies,
} from '@/entities/vacancy';
import { VacanciesPage as VacanciesPageComponent } from '@/pages/VacanciesPage';
import { Vacancies, i18Namespace } from '@/shared/config';

export const dynamic = 'force-dynamic';

interface PageProps {
	params: Promise<{ locale: string; specialization: string }>;
	searchParams: Promise<GetVacanciesListParamsRequest>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale, specialization } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.vacancies });
	const currentSpecialization = await getSpecializationBySlug(specialization).catch(() => null);
	if (!currentSpecialization) {
		return { title: 'Not Found' };
	}
	const title = t(Vacancies.LIST_PAGE_TITLE, { specialization: currentSpecialization.title });
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

const MainVacanciesPage = async ({ searchParams, params }: PageProps) => {
	const {
		page = '1',
		search,
		skillId,
		industry,
		grade,
		companyType,
		employmentForm,
		salaryBucket,
		englishLevel,
		workFormat,
	} = await searchParams;
	const { locale, specialization } = await params;
	setRequestLocale(locale);

	const pageNum = Number(page);
	const currentSpecialization = await getSpecializationBySlug(specialization).catch(() => null);
	const hasFilters =
		!!search ||
		!!skillId ||
		!!industry ||
		!!grade ||
		!!companyType ||
		!!employmentForm ||
		!!salaryBucket ||
		!!englishLevel ||
		!!workFormat;

	if (!currentSpecialization) {
		notFound();
	}

	const specializationId = currentSpecialization.id;

	const [vacanciesResponse, specializationsResponse, skillsResponse] = await Promise.all([
		getVacancies({
			page: pageNum,
			limit: MAX_SHOW_LIMIT_VACANCIES,
			search,
			skillId,
			salaryBucket,
			industry,
			grade,
			employmentForm,
			companyType,
			englishLevel,
			workFormat,
		}),
		getSpecializations({ limit: 5 }),
		getSkills({ limit: 5, specializations: specializationId }),
	]);
	return (
		<>
			<VacanciesPageComponent
				vacancies={vacanciesResponse?.data || []}
				total={vacanciesResponse?.total || 0}
				limit={vacanciesResponse?.limit || 0}
				page={pageNum}
				hasFilters={hasFilters}
				initialSpecializations={specializationsResponse}
				initialSkills={skillsResponse}
				currentSpecialization={currentSpecialization}
			/>
		</>
	);
};

export default MainVacanciesPage;
