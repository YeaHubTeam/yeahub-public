import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ImageWithWrapperSkeleton } from '@/shared/ui/ImageWithWrapper';
import { TextSkeleton } from '@/shared/ui/Text';

import styles from './VacancyCard.module.css';

export const VacancyCardSkeleton = () => {
	return (
		<Card withOutsideShadow className={styles.content}>
			<Flex gap="40" direction="column">
				<Flex gap="12" wrap="wrap" justify="between">
					<Flex gap="9" align="end" className={styles['company-info']}>
						<ImageWithWrapperSkeleton className={styles['image-wrapper']} />
						<TextSkeleton variant="body3-accent" className={styles['company-name']} width={100} />
					</Flex>
					<TextSkeleton variant="body5-accent" className={styles['published-date']} width={100} />
					<TextSkeleton variant="body6" className={styles.title} width={300} />
				</Flex>
				<Flex gap="20" direction="column">
					<Flex gap="10" className={styles.conditions}>
						<TextSkeleton variant="body3-accent" width={80} />
						<TextSkeleton variant="body3-accent" width={80} />
						<TextSkeleton variant="body3-accent" width={80} />
						<TextSkeleton variant="body3-accent" width={80} />
					</Flex>
					<Flex gap="10" align="center">
						<TextSkeleton variant="body1-accent" className={styles.skill} width={80} />
						<TextSkeleton variant="body1-accent" className={styles.skill} width={80} />
						<TextSkeleton variant="body1-accent" className={styles.skill} width={80} />
						<TextSkeleton variant="body1-accent" className={styles.skill} width={80} />
					</Flex>
					<Flex justify="between">
						<Flex gap="10">
							<TextSkeleton variant="body3-accent" width={100} />
							<TextSkeleton variant="body3-accent" width={100} />
						</Flex>
						<TextSkeleton variant="body3-accent" width={100} />
					</Flex>
				</Flex>
			</Flex>
		</Card>
	);
};
