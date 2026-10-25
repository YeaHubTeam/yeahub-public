import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { MentorWorldwidePage } from '@/pages/MentorWorldwidePage';
import { APP_ROUTE, MentorWorldwide, ROUTES, i18Namespace, locales } from '@/shared/config';

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
	const t = await getTranslations({ locale, namespace: i18Namespace.mentorWorldwide });
	const title = t(MentorWorldwide.SEO_TITLE);
	const description = t(MentorWorldwide.SEO_DESCRIPTION);

	return {
		title,
		description,
	};
}

const Page = async ({ params }: PageProps) => {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.mentorWorldwide });

	const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || APP_ROUTE).replace(/\/$/, '');
	const pageUrl = `${siteUrl}/${locale}${ROUTES['mentor-worldwide'].page}`;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebPage',
				'@id': pageUrl,
				url: pageUrl,
				name: t(MentorWorldwide.BANNER_TITLE),
				description: t(MentorWorldwide.BANNER_DESCRIPTION),
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
						name: t(MentorWorldwide.BANNER_TITLE),
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
			<MentorWorldwidePage locale={locale} />
		</>
	);
};

export default Page;
