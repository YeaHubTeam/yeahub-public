import { Flex } from '@/shared/ui/Flex';

import { BannerContent } from '../BannerContent/BannerContent';
import styles from './Banner.module.css';
import { ShapeSVG } from './ShapeSVG';

export const Banner = () => {
	return (
		<Flex justify="center" className={styles['banner-block']} componentType="section">
			<BannerContent />
			<div className={styles['shape-container']}>
				<ShapeSVG className={styles['shape-svg']} aria-hidden="true" />
			</div>
		</Flex>
	);
};
