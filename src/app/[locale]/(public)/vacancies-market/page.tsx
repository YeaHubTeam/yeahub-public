import { setRequestLocale } from 'next-intl/server';

import { getVacanciesMarketOverview } from '@/entities/vacancy';
import { VacanciesMarketPage } from '@/pages/VacanciesMarketPage';

export const dynamic = 'auto';

interface VacanciesMarketRouteProps {
	params: Promise<{
		locale: string;
	}>;
}

const VacanciesMarketRoute = async ({ params }: VacanciesMarketRouteProps) => {
	const { locale } = await params;

	setRequestLocale(locale);

	const overview = await getVacanciesMarketOverview();

	return <VacanciesMarketPage overview={overview} />;
};

export default VacanciesMarketRoute;
