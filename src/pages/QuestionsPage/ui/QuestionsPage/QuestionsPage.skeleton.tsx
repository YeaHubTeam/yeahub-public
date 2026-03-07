import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { TablePaginationSkeleton } from '@/shared/ui/TablePagination';
import { FullQuestionsListSkeleton } from '@/widgets/question/QuestionsList';

import { QuestionsFilterPanelSkeleton } from '../QuestionsFilterPanel/QuestionsFilterPanel.skeleton';
import { QuestionsPageHeaderSkeleton } from '../QuestionsPageHeader/QuestionsPageHeader.skeleton';
import styles from './QuestionsPage.module.css';

export const QuestionsPageSkeleton = () => {
	return (
		<Flex gap="20" align="start">
			<Card className={styles.main}>
				<QuestionsPageHeaderSkeleton />
				<FullQuestionsListSkeleton />
				<TablePaginationSkeleton />
			</Card>
			<Card className={styles.filters}>
				<QuestionsFilterPanelSkeleton />
			</Card>
		</Flex>
	);
};
