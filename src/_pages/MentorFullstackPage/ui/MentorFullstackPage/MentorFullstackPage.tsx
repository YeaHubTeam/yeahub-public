import { Flex } from '@/shared/ui/Flex';

import { AboutSection } from '../AboutSection';
import { BannerSection } from '../BannerSection';
import { DeveloperStack } from '../DeveloperStack';
import { EducationSection } from '../EducationSection';
import { FullPathSection } from '../FullPathSection';
import { PracticeSection } from '../PracticeSection';
import { PricingSection } from '../PricingSection';
import { StrategySection } from '../StrategySection';
import styles from './MentorFullstackPage.module.css';

export const MentorFullstackPage = () => {
	return (
		<Flex direction="column" className={styles.page}>
			<BannerSection />
			<StrategySection />
			<DeveloperStack />
			<PracticeSection />
			<FullPathSection />
			<EducationSection />
			<AboutSection />
			<PricingSection />
		</Flex>
	);
};
