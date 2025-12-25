import { Metadata } from 'next';

import { HhAnalyticsPage as HhAnalyticsPageComponent } from '@/pages/HhAnalyticsPage';

interface PageProps {
	searchParams?: Promise<{
		page?: string;
		mode?: string;
		specialization?: string;
	}>;
	params: Promise<{
		locale: string;
	}>;
}

export const metadata: Metadata = {
	title: 'HH Analytics',
	description: 'Аналитика вакансий с HeadHunter',
};

const HhAnalyticsPage = async ({ searchParams, params }: PageProps) => {
	const resolvedSearchParams = await searchParams;
	const resolvedParams = await params;

	const processedSearchParams = resolvedSearchParams
		? {
				...resolvedSearchParams,
				mode:
					resolvedSearchParams.mode === 'skills' || resolvedSearchParams.mode === 'keywords'
						? resolvedSearchParams.mode
						: ('skills' as 'skills' | 'keywords'),
			}
		: undefined;

	return <HhAnalyticsPageComponent searchParams={processedSearchParams} params={resolvedParams} />;
};

export default HhAnalyticsPage;
