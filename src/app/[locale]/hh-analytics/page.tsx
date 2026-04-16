import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { HhAnalyticsPage as HhAnalyticsPageComponent } from '@/pages/HhAnalyticsPage';
import { Analytics, i18Namespace } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';

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

	const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://yeahub.ru').replace(/\/$/, '');
	const canonical = `${baseUrl}/${locale}/hh-analytics`;

	return {
		title,
		description,
		keywords,
		alternates: {
			canonical,
		},
		openGraph: {
			title,
			description,
			type: 'website',
			url: canonical,
		},
	};
}

const HhAnalyticsPage = async ({ searchParams, params }: PageProps) => {
	const resolvedSearchParams = await searchParams;
	const resolvedParams = await params;
	const { locale } = resolvedParams;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.analytics });

	const siteUrl = process.env.NEXT_PUBLIC_APP_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/hh-analytics`;

	const titleSkills = t(Analytics.HH_ANALYTICS_TITLE_SKILLS);
	const titleKeywords = t(Analytics.HH_ANALYTICS_TITLE_KEYWORDS);

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebPage',
				'@id': pageUrl,
				url: pageUrl,
				name: `${titleSkills} / ${titleKeywords}`,
				description: `${titleSkills}. ${titleKeywords}.`,
				isPartOf: {
					'@type': 'WebSite',
					url: siteUrl,
					name: 'YeaHub',
				},
			},
			{
				'@type': 'Dataset',
				name: titleSkills,
				description: `${titleSkills}. ${titleKeywords}.`,
				url: pageUrl,
				keywords: [t(Analytics.HH_ANALYTICS_TAB_SKILLS), t(Analytics.HH_ANALYTICS_TAB_KEYWORDS)],
				creator: {
					'@type': 'Organization',
					name: 'YeaHub',
					url: siteUrl,
				},
				distribution: {
					'@type': 'DataDownload',
					encodingFormat: 'text/html',
					contentUrl: pageUrl,
				},
				measurementTechnique: 'HeadHunter API',
			},
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						name: 'YeaHub',
						item: siteUrl,
					},
					{
						'@type': 'ListItem',
						position: 2,
						name: `${titleSkills} / ${titleKeywords}`,
						item: pageUrl,
					},
				],
			},
		],
	};

	const processedSearchParams = resolvedSearchParams
		? {
				...resolvedSearchParams,
				mode:
					resolvedSearchParams.mode === 'skills' || resolvedSearchParams.mode === 'keywords'
						? resolvedSearchParams.mode
						: ('skills' as 'skills' | 'keywords'),
			}
		: undefined;

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<HhAnalyticsPageComponent searchParams={processedSearchParams} params={resolvedParams} />
		</>
	);
};

export default HhAnalyticsPage;
