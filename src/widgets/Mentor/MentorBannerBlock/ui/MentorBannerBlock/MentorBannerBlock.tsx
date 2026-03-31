import { Flex } from '@/shared/ui/Flex';

import { MentorBannerAdvantages } from '../MentorBannerAdvantages/MentorBannerAdvantages';
import { MentorBannerContent } from '../MentorBannerContent/MentorBannerContent';
import styles from './MentorBannerBlock.module.css';
import { ShapeSVG } from './ShapeSVG';

export const MentorBannerBlock = () => {
	return (
		<Flex direction="column" gap="20" className={styles.wrapper}>
			<Flex
				justify="center"
				align="center"
				className={styles['banner-block']}
				componentType="section"
			>
				<MentorBannerContent />
				<div className={styles['shape-container']}>
					<ShapeSVG className={styles['shape-svg']} aria-hidden="true" />
				</div>
			</Flex>
			<MentorBannerAdvantages />
		</Flex>
	);
};
