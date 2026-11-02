import { Flex } from '@/shared/ui/Flex';

import { BannerContent } from '../BannerContent/BannerContent';
import styles from './Banner.module.css';

export const Banner = () => {
	return (
		<Flex justify="center" align="center" className={styles.banner} componentType="section">
			<div className={styles.background} aria-hidden="true">
				<span className={styles['top-band']} />
				<span className={styles['swirl-body']} />
				<span className={styles['swirl-fold']} />
				<span className={styles['swirl-light']} />
				<span className={styles['vortex-eye']} />
				<span className={styles['text-calm']} />
			</div>
			<BannerContent />
		</Flex>
	);
};
