import { Metadata } from 'next';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import {
	type GetPublicArticlesParamsRequest,
	MAX_SHOW_LIMIT_ARTICLES,
	getArticlesList,
} from '@/entities/article';
import { ArticlesPage as ArticlesPageComponent } from '@/pages/ArticlesPage';
import { Articles, i18Namespace } from '@/shared/config';

export const dynamic = 'force-dynamic';

interface PageProps {
	params: Promise<{ locale: string }>;
	searchParams: Promise<GetPublicArticlesParamsRequest>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale } = await params;

	setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: i18Namespace.articles });

	const title = t(Articles.TITLE);
	const description = t(Articles.DESCRIPTION);

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: 'website',
		},
	};
}

const MainArticlesPage = async ({ params, searchParams }: PageProps) => {
	const { locale } = await params;
	setRequestLocale(locale);
	const { page = '1' } = await searchParams;

	const pageNum = Number(page);

	const articles = await getArticlesList({ page: pageNum, limit: MAX_SHOW_LIMIT_ARTICLES });

	return (
		<>
			<ArticlesPageComponent
				articles={articles?.data || []}
				total={articles?.total || 0}
				limit={articles?.limit || 0}
				page={pageNum}
				locale={locale}
			/>
		</>
	);
};

export default MainArticlesPage;
