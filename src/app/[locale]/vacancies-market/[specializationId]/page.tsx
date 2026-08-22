import { setRequestLocale } from 'next-intl/server';

import { getVacanciesMarketOverviewById } from '@/entities/vacancyMarket';
import { VacancyMarketPage } from '@/pages/VacancyMarketPage';

export const dynamic = 'auto';

interface VacancyMarketRouteProps {
	params: Promise<{
		locale: string;
		specializationId: string;
	}>;
}

const VacancyMarketRoute = async ({ params }: VacancyMarketRouteProps) => {
	const { locale, specializationId } = await params;

	setRequestLocale(locale);

	const vacancy = await getVacanciesMarketOverviewById(specializationId).catch(() => ({
		data: undefined,
	}));

	return <VacancyMarketPage vacancy={vacancy} />;
};

export default VacancyMarketRoute;
