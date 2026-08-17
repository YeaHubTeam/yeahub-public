import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Skeleton } from '@/shared/ui/Skeleton';
import { TextSkeleton } from '@/shared/ui/Text';

import styles from './VacanciesMarketSummary.module.css';

export const VacanciesMarketSummarySkeleton = () => {
	return (
		<Card
			size="small"
			withOutsideShadow
			className={styles.summary}
			contentClassName={styles.content}
		>
			<div className={styles.main}>
				<div className={styles['icon-slot']}>
					<Skeleton width={44} height={44} borderRadius={8} />
				</div>

				<Flex direction="column" gap="4" className={styles.value}>
					<TextSkeleton variant="body1" width={220} />
					<TextSkeleton variant="body3-accent" width={64} />
				</Flex>
			</div>

			<div className={styles.note}>
				<Skeleton width={20} height={20} borderRadius="50%" />
				<TextSkeleton variant="body1" width={237} />
			</div>
		</Card>
	);
};
