import { CardSkeleton } from '@/shared/ui/Card';

import { PassedQuestionsItemSkeleton } from '../PassedQuestionsItem/PassedQuestionsItem.skeleton';
import { PassedQuestionsListProps } from './PassedQuestionsList';
import styles from './PassedQuestionsList.module.css';

type PassedQuestionsListSkeletonProps = Omit<PassedQuestionsListProps, 'locale'>;

export const PassedQuestionsListSkeleton = ({ className }: PassedQuestionsListSkeletonProps) => {
	return (
		<CardSkeleton className={className} isTitleCenter title="title">
			<ul className={styles.list}>
				{[...Array(6)].map((_, index) => (
					<PassedQuestionsItemSkeleton key={index} />
				))}
			</ul>
		</CardSkeleton>
	);
};
