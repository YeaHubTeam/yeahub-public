import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { HhAnalyticsPage as HhAnalyticsPageComponent } from '@/pages/HhAnalyticsPage';
import { Analytics, i18Namespace } from '@/shared/config';

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.analytics });

	const titleSkills = t(Analytics.HH_ANALYTICS_TITLE_SKILLS);
	const titleKeywords = t(Analytics.HH_ANALYTICS_TITLE_KEYWORDS);
	const title = `${titleSkills} / ${titleKeywords}`;
	const description = `${titleSkills}. ${titleKeywords}.`;
	const keywords = [
		titleSkills,
		titleKeywords,
		t(Analytics.HH_ANALYTICS_TAB_SKILLS),
		t(Analytics.HH_ANALYTICS_TAB_KEYWORDS),
	];

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
