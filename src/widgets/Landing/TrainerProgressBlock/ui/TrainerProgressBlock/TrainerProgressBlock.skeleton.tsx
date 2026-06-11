import { useScreenSize } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { TextSkeleton } from '@/shared/ui/Text';

import { InfoBlockSkeleton } from '../InfoBlock/InfoBlock.skeleton';
import styles from './TrainerProgressBlock.module.css';

export const TrainerProgressBlockSkeleton = () => {
	const { isMobile, isTablet } = useScreenSize();

	return (
		<section className={styles['interview-trainer']}>
			<div className={styles['title-block']}>
				<TextSkeleton width={isMobile ? 250 : 350} variant="head3" className={styles.title} />
				<TextSkeleton width={isMobile ? 280 : 450} variant="body3" className={styles.subtitle} />
			</div>
			<Flex
				gap="20"
				className={styles['interview-trainer-wrapper']}
				direction={isTablet || isMobile ? 'column' : 'row'}
			>
				<InfoBlockSkeleton />
				<InfoBlockSkeleton />
			</Flex>
		</section>
	);
};
