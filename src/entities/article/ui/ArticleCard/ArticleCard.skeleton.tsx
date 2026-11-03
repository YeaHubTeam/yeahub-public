import { CardSkeleton } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ImageWithWrapperSkeleton } from '@/shared/ui/ImageWithWrapper';
import { TextSkeleton } from '@/shared/ui/Text';

import styles from './ArticleCard.module.css';

export const ArticleCardSkeleton = () => {
	return (
		<CardSkeleton withOutsideShadow className={styles.card}>
			<Flex gap="20" className={styles.wrapper}>
				<ImageWithWrapperSkeleton className={styles.image} />
				<Flex direction="column" gap="16" flex={1}>
					<Flex align="center" gap="6">
						<TextSkeleton variant="body3" width={90} />
						<TextSkeleton variant="body3" width={80} />
					</Flex>

					<Flex gap="8" direction="column">
						<TextSkeleton variant="body3-accent" width="85%" />
						<TextSkeleton variant="body3" width="60%" />
						<TextSkeleton variant="body3" width="75%" />
					</Flex>

					<TextSkeleton variant="body3" width={65} />
				</Flex>
			</Flex>
		</CardSkeleton>
	);
};
