import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Skeleton } from '@/shared/ui/Skeleton';

import styles from './QuizPage.module.css';

export const QuizPageSkeleton = ({ dataTestId }: { dataTestId?: string }) => {
	return (
		<Flex dataTestId={dataTestId} direction="column" className={styles.container}>
			<Card>
				<Flex gap="16" direction="column">
					<div className={styles['progress-bar']}>
						<Skeleton width={240} height={24} />
						<Skeleton width={24} height={24} />
					</div>
					<Skeleton width="100%" height={3} borderRadius={50} />
				</Flex>
			</Card>

			<Card className={styles['slider-card-skeleton']}>
				<Flex direction="column" gap="16">
					<Flex justify="between" className={styles['slider-navigation']}>
						{Array.from({ length: 2 }).map((_, i) => (
							<Skeleton key={i} width={28} height={28} borderRadius="50%" />
						))}
					</Flex>

					<div className={styles['slider-skeleton']}>
						<Skeleton width="100%" height={40} />
						<Skeleton width={137} height={14} />

						<Flex gap="8">
							{Array.from({ length: 2 }).map((_, i) => (
								<Skeleton key={i} height={44} width={100} borderRadius={12} />
							))}
						</Flex>
					</div>

					<Skeleton height={48} width={128} />
				</Flex>
			</Card>
		</Flex>
	);
};
