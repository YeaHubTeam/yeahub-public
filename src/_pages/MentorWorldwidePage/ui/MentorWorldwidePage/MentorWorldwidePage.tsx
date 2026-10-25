import { Flex } from '@/shared/ui/Flex';

import { BannerSection } from '../BannerSection';
import styles from './MentorWorldwidePage.module.css';

export const MentorWorldwidePage = () => {
	return (
		<Flex direction="column" className={styles.page}>
			<BannerSection />
		</Flex>
	);
};
