import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { TablePaginationSkeleton } from '@/shared/ui/TablePagination';
import { FullQuestionsListSkeleton } from '@/widgets/question/QuestionsList';

import { TestQuestionsPageHeaderSkeleton } from '../TestQuestionsPageHeader/TestQuestionsPageHeader.skeleton';
import styles from './TestQuestionsPage.module.css';

export const TestQuestionsPageSkeleton = () => {
	return (
		<Flex gap="20" align="start">
			<Card className={styles.main}>
				<TestQuestionsPageHeaderSkeleton />
				<FullQuestionsListSkeleton />
				<TablePaginationSkeleton />
			</Card>
		</Flex>
	);
};
