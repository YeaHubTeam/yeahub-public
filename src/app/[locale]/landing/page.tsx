import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Collection, getCollectionsList } from '@/entities/collection';
import { getCompanies } from '@/entities/company';
import { getSkills } from '@/entities/skill';
import { LandingPage as LandingPageComponent } from '@/pages/LandingPage';
import { Landing, i18Namespace } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.landing });

	const title = t(Landing.BANNER_TITLE);
	const description = t(Landing.BANNER_DESCRIPTION);
	const keywords = [
		t(Landing.BANNER_STICKER_SKILL),
		t(Landing.BANNER_STICKER_CANDIDATE),
		t(Landing.SPECIALIZATION_NEW_TITLE),
		t(Landing.SPECIALIZATION_BUTTON),
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

const LandingPage = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.landing });

	const siteUrl = process.env.APP_SITE_URL || APP_ROUTE;
	const pageUrl = `${siteUrl}/${locale}/landing`;

	const title = t(Landing.BANNER_TITLE);
	const description = t(Landing.BANNER_DESCRIPTION);

	const [companiesResponse, skillsResponse, ...collectionsResponse] = await Promise.all([
		getCompanies({ limit: 100 }),
		getSkills({ limit: 100 }),
		getCollectionsList({ limit: 10, specializations: 11 }),
		getCollectionsList({ limit: 10, specializations: 19 }),
		getCollectionsList({ limit: 10, specializations: 27 }),
	]);

	const getRandomCollection = (collections: Collection[]) => {
		const randomIndex = Math.floor(Math.random() * collections.length);
		return collections[randomIndex];
	};

	const collections = collectionsResponse.map(({ data }) => getRandomCollection(data));

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
							description: t(Landing.SPECIALIZATION_CARD_DESCRIPTION_FRONTEND),
						},
						{
							'@type': 'ListItem',
							position: 2,
							name: 'Backend',
							description: t(Landing.SPECIALIZATION_CARD_DESCRIPTION_BACKEND),
						},
						{
							'@type': 'ListItem',
							position: 3,
							name: 'Data Science',
							description: t(Landing.SPECIALIZATION_CARD_DESCRIPTION_DATA),
						},
						{
							'@type': 'ListItem',
							position: 4,
							name: 'Machine Learning',
							description: t(Landing.SPECIALIZATION_CARD_DESCRIPTION_MACHINE),
						},
						{
							'@type': 'ListItem',
							position: 5,
							name: 'Testing',
							description: t(Landing.SPECIALIZATION_CARD_DESCRIPTION_TESTING),
						},
						{
							'@type': 'ListItem',
							position: 6,
							name: 'iOS',
							description: t(Landing.SPECIALIZATION_CARD_DESCRIPTION_IOS),
						},
						{
							'@type': 'ListItem',
							position: 7,
							name: 'Android',
							description: t(Landing.SPECIALIZATION_CARD_DESCRIPTION_ANDROID),
						},
						{
							'@type': 'ListItem',
							position: 8,
							name: 'Game Development',
							description: t(Landing.SPECIALIZATION_CARD_DESCRIPTION_GAME),
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
			<LandingPageComponent
				skills={skillsResponse.data}
				companies={companiesResponse.data}
				collections={collections}
			/>
		</>
	);
};

export default LandingPage;
