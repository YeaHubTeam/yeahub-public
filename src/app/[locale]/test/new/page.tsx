import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getSkills } from '@/entities/skill';
import { DEFAULT_SPECIALIZATION_ID } from '@/entities/specialization';
import { CreateTestPage } from '@/pages/CreateTestPage';
import { TestCreate, i18Namespace } from '@/shared/config';

interface PageProps {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ specialization?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: i18Namespace.testCreate });
	const title = t(TestCreate.TITLE);

	return {
		title,
		openGraph: {
			title,
			type: 'website',
		},
	};
}

const MainCreateTestPage = async ({ params, searchParams }: PageProps) => {
	const { locale } = await params;
	const { specialization } = await searchParams;
	const requestedSpecialization = Number(specialization);
	const specializationId =
		Number.isInteger(requestedSpecialization) && requestedSpecialization > 0
			? requestedSpecialization
			: DEFAULT_SPECIALIZATION_ID;

	setRequestLocale(locale);

	const skillsResponse = await getSkills({ limit: 5, specializations: specializationId });
	const skills =
		skillsResponse.total > skillsResponse.data.length
			? await getSkills({ limit: skillsResponse.total, specializations: specializationId })
			: skillsResponse;

	return <CreateTestPage locale={locale} initialSkills={skills} />;
};

export default MainCreateTestPage;
