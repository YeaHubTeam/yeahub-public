import { Flex } from '@/shared/ui/Flex';

import { BannerSection } from '../BannerSection';
import styles from './MentorFullstackPage.module.css';

export const MentorFullstackPage = () => {
	return (
		<Flex direction="column" className={styles.page}>
			<BannerSection />
		</Flex>
	);
};
