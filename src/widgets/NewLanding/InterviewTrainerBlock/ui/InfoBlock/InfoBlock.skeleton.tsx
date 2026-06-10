import { Flex } from '@/shared/ui/Flex';
import { Skeleton } from '@/shared/ui/Skeleton';
import { TextSkeleton } from '@/shared/ui/Text';

import styles from './InfoBlock.module.css';

export const InfoBlockSkeleton = () => {
	return (
		<div className={styles['info-block-wrapper']}>
			<Flex style={{ height: '100%' }} direction="row" className={styles['info-block']}>
				<div className={styles['info-block-main-wrapper']}>
					<Flex className={styles['info-block-main']} gap="20" direction="column">
						<div className={styles['circle-wrapper']}>
							<Skeleton width={24} height={24} borderRadius="50%" />
						</div>
						<Flex gap="8" direction="column">
							<TextSkeleton width={200} variant="head3" />
							<TextSkeleton width="100%" variant="body3" rows={3} />
							<Flex gap="8" align="center">
								<TextSkeleton width={80} variant="body3" />
								<Skeleton width={16} height={16} borderRadius="4px" />
							</Flex>
						</Flex>
					</Flex>
				</div>

				<div className={styles['image-wrapper']}>
					<Skeleton width="100%" height={200} borderRadius="12px" />
				</div>
			</Flex>
		</div>
	);
};
