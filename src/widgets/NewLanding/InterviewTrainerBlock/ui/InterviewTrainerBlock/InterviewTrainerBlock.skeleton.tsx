import { useScreenSize } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { TextSkeleton } from '@/shared/ui/Text';

import { InfoBlockSkeleton } from '../InfoBlock/InfoBlock.skeleton';
import styles from './InterviewTrainerBlock.module.css';

export const InterviewTrainerBlockSkeleton = () => {
	const { isMobile, isTablet } = useScreenSize();

	return (
		<section className={styles['interview-trainer']}>
			<div className={styles['title-block']}>
				<TextSkeleton
					width={isMobile ? 280 : 350}
					variant={isMobile ? 'body5-accent' : 'head4'}
					className={styles.title}
				/>
				<TextSkeleton
					width={isMobile ? 300 : 450}
					variant="body3"
					className={styles.subtitle}
					rows={isMobile ? 2 : 1}
				/>
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
