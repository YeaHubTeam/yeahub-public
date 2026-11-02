import { Flex } from '@/shared/ui/Flex';

import { Banner } from '../Banner/Banner';
import { BannerAdvantages } from '../BannerAdvantages/BannerAdvantages';
import styles from './BannerSection.module.css';

export const BannerSection = () => {
	return (
		<Flex direction="column" gap="20" className={styles.wrapper}>
			<Banner />
			<BannerAdvantages />
		</Flex>
	);
};
