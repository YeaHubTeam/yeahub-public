import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { NewLandingPage as NewLandingPageComponent } from '@/pages/NewLandingPage';
import { Landing, i18Namespace } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.landing });

	const title = t(Landing.SEO_TITLE);
	const description = t(Landing.SEO_DESCRIPTION);
	const keywords = t(Landing.SEO_KEYWORDS);

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

const NewLandingPage = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.landing });

	const siteUrl = process.env.NEXT_PUBLIC_APP_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/new-landing`;

	const title = t(Landing.BANNER_TITLE);
	const description = t(Landing.BANNER_DESCRIPTION);

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Organization',
				'@id': `${siteUrl}/#organization`,
				name: 'YeaHub',
				url: siteUrl,
				description: description,
				sameAs: [],
			},
			{
				'@type': 'WebSite',
				'@id': `${siteUrl}/#website`,
				url: siteUrl,
				name: 'YeaHub',
				publisher: {
					'@id': `${siteUrl}/#organization`,
				},
				potentialAction: {
					'@type': 'SearchAction',
					target: `${siteUrl}/${locale}/questions?titleOrDescription={search_term_string}`,
					'query-input': 'required name=search_term_string',
				},
			},
			{
				'@type': 'WebPage',
				'@id': pageUrl,
				url: pageUrl,
				name: title,
				description: description,
				isPartOf: {
					'@id': `${siteUrl}/#website`,
				},
				about: {
					'@id': `${siteUrl}/#organization`,
				},
				mainEntity: {
					'@type': 'ItemList',
					name: t(Landing.SPECIALIZATION_NEW_TITLE),
					description: t(Landing.SPECIALIZATION_DESCRIPTION),
					itemListElement: [
						{
							'@type': 'ListItem',
							position: 1,
							name: 'Frontend',
							description: t(Landing.INTERVIEW_SPECIALIZATION_CARD_DESCRIPTION_FRONTEND),
						},
						{
							'@type': 'ListItem',
							position: 2,
							name: 'Python',
							description: t(Landing.INTERVIEW_SPECIALIZATION_CARD_DESCRIPTION_PYTHON),
						},
						{
							'@type': 'ListItem',
							position: 3,
							name: 'Java',
							description: t(Landing.INTERVIEW_SPECIALIZATION_CARD_DESCRIPTION_JAVA),
						},
						{
							'@type': 'ListItem',
							position: 4,
							name: 'Node.js',
							description: t(Landing.INTERVIEW_SPECIALIZATION_CARD_DESCRIPTION_NODE_JS),
						},
						{
							'@type': 'ListItem',
							position: 5,
							name: 'QA En',
							description: t(Landing.INTERVIEW_SPECIALIZATION_CARD_DESCRIPTION_QA_ENGINEER),
						},
						{
							'@type': 'ListItem',
							position: 6,
							name: 'iOS',
							description: t(Landing.INTERVIEW_SPECIALIZATION_CARD_DESCRIPTION_GOLANG),
						},
					],
				},
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
						name: title,
						item: pageUrl,
					},
				],
			},
		],
	};
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<NewLandingPageComponent />
		</>
	);
};
export default NewLandingPage;
