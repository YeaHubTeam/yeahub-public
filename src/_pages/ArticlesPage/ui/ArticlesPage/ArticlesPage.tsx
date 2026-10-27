import { setRequestLocale } from 'next-intl/server';

import type { Article } from '@/entities/article';
import { Flex } from '@/shared/ui/Flex';
import { ArticlesList } from '@/widgets/Article';

import { ArticlesPageHeader } from '../ArticlesPageHeader/ArticlesPageHeader';
import { ArticlesPagePagination } from '../ArticlesPagePagination/ArticlesPagePagination';
import styles from './ArticlesPage.module.css';

interface ArticlesPageProps {
	articles: Article[];
	page: number;
	total: number;
	limit: number;
	locale: string;
}

export const ArticlesPage = ({ articles, page, total, limit, locale }: ArticlesPageProps) => {
	setRequestLocale(locale);
	return (
		<Flex gap="20" align="start">
			<Flex gap="20" direction="column" className={styles.main}>
				<ArticlesPageHeader />
				<ArticlesList articles={articles} locale={locale} />
				<ArticlesPagePagination total={total} limit={limit} currentPage={page} />
			</Flex>
		</Flex>
	);
};
