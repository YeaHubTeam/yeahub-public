import { ArticleCardSkeleton, MAX_SHOW_LIMIT_ARTICLES } from '@/entities/article';
import { Flex } from '@/shared/ui/Flex';

export const ArticlesListSkeleton = () => {
	return (
		<Flex direction="column" gap="20">
			{[...Array(MAX_SHOW_LIMIT_ARTICLES)].map((_, i) => (
				<ArticleCardSkeleton key={i} />
			))}
		</Flex>
	);
};
