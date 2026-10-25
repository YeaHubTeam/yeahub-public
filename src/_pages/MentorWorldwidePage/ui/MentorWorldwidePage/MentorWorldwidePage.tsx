import { Flex } from '@/shared/ui/Flex';

import { BannerSection } from '../BannerSection';
import { StrategySection } from '../StrategySection';
import styles from './MentorWorldwidePage.module.css';

export const MentorWorldwidePage = () => {
	return (
		<Flex direction="column" className={styles.page}>
			<BannerSection />
			<StrategySection />
		</Flex>
	);
};
