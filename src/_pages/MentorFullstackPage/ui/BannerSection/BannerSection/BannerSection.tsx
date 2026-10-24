import { Flex } from '@/shared/ui/Flex';

import { Banner } from '../Banner/Banner';
import styles from './BannerSection.module.css';

export const BannerSection = () => {
	return (
		<Flex direction="column" className={styles.wrapper}>
			<Banner />
		</Flex>
	);
};
