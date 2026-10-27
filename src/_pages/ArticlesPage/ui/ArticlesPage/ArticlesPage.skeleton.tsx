import { Flex } from '@/shared/ui/Flex';
import { TablePaginationSkeleton } from '@/shared/ui/TablePagination';
import { ArticlesListSkeleton } from '@/widgets/Article';

import { ArticlesPageHeaderSkeleton } from '../ArticlesPageHeader/ArticlesPageHeader.skeleton';
import styles from './ArticlesPage.module.css';

export const ArticlesPageSkeleton = () => {
	return (
		<Flex gap="20" align="start">
			<Flex gap="20" direction="column" className={styles.main}>
				<ArticlesPageHeaderSkeleton />
				<ArticlesListSkeleton />
				<TablePaginationSkeleton />
			</Flex>
		</Flex>
	);
};
