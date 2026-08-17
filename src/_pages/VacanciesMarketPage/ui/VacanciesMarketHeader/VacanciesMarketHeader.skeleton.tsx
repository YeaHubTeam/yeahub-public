import { Flex } from '@/shared/ui/Flex';
import { Skeleton } from '@/shared/ui/Skeleton';
import { TextSkeleton } from '@/shared/ui/Text';

import styles from './VacanciesMarketHeader.module.css';

export const VacanciesMarketHeaderSkeleton = () => {
	return (
		<Flex direction="column" gap="12" className={styles.header}>
			<TextSkeleton variant="head2" width="70%" className={styles.title} />

			<Skeleton width="100%" height={63} borderRadius={4} style={{ maxWidth: 502 }} />

			<Flex align="center" gap="6">
				<Skeleton width={20} height={20} borderRadius={4} />

				<TextSkeleton variant="body1" width={150} />
			</Flex>
		</Flex>
	);
};
