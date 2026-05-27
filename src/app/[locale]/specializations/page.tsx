import { setRequestLocale } from 'next-intl/server';

import { getSpecializations } from '@/entities/specialization';
import { SpecializationsPage } from '@/pages/SpecializationsPage';

interface PageProps {
	params: Promise<{ locale: string }>;
}

const Page = async ({ params }: PageProps) => {
	const { locale } = await params;
	setRequestLocale(locale);

	const specializations = await getSpecializations({ limit: 100 });

	return <SpecializationsPage specializations={specializations} />;
};

export const metadata = {
	title: 'Все специализации',
	description: 'Выберите свою специальность',
};

export default Page;
