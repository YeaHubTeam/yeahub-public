import { useTranslations } from 'next-intl';

import type { Article } from '@/entities/article';
import { ArticleCard } from '@/entities/article';
import { Articles, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Stub } from '@/shared/ui/Stub';

interface ArticlesListProps {
	articles: Article[];
	locale: string;
}

export const ArticlesList = ({ articles, locale }: ArticlesListProps) => {
	const t = useTranslations(i18Namespace.articles);

	if (articles.length === 0) {
		return (
			<Stub
				type="empty"
				title={t(Articles.STUB_EMPTY_TITLE)}
				subtitle={t(Articles.STUB_EMPTY_SUBTITLE)}
			/>
		);
	}

	return (
		<Flex direction="column" gap="20">
			{articles.map((article) => (
				<ArticleCard key={article.id} article={article} locale={locale} />
			))}
		</Flex>
	);
};
