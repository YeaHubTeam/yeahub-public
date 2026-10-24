import { Flex } from '@/shared/ui/Flex';

import { BannerSection } from '../BannerSection';
import { DeveloperStack } from '../DeveloperStack';
import { StrategySection } from '../StrategySection';
import styles from './MentorFullstackPage.module.css';

export const MentorFullstackPage = () => {
	return (
		<Flex direction="column" className={styles.page}>
			<BannerSection />
			<StrategySection />
			<DeveloperStack />
		</Flex>
	);
};
