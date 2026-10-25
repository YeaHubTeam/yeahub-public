import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { MentorFullstackPage } from '@/pages/MentorFullstackPage';
import { APP_ROUTE, MentorFullstack, ROUTES, i18Namespace, locales } from '@/shared/config';

export const dynamic = 'force-static';

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

interface PageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.mentorFullstack });
	const title = t(MentorFullstack.SEO_TITLE);
	const description = t(MentorFullstack.SEO_DESCRIPTION);

	return {
		title,
		description,
	};
}

const Page = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.mentorFullstack });

	const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || APP_ROUTE).replace(/\/$/, '');
	const pageUrl = `${siteUrl}/${locale}${ROUTES['mentor-fullstack'].page}`;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebPage',
				'@id': pageUrl,
				url: pageUrl,
				name: t(MentorFullstack.BANNER_TITLE),
				description: t(MentorFullstack.BANNER_DESCRIPTION),
				isPartOf: {
					'@type': 'WebSite',
					url: siteUrl,
					name: 'YeaHub',
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
						name: t(MentorFullstack.BANNER_TITLE),
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
			<MentorFullstackPage locale={locale} />
		</>
	);
};

export default Page;
