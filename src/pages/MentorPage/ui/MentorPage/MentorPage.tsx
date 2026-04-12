import { Flex } from '@/shared/ui/Flex';
import { AboutSection } from '@/widgets/Mentor/AboutSection';
import { BannerSection } from '@/widgets/Mentor/BannerSection';
import { EducationSection } from '@/widgets/Mentor/EducationSection';
import { FeaturesSection } from '@/widgets/Mentor/FeaturesSection';
import { FullPathSection } from '@/widgets/Mentor/FullPathSection';
import { StackSection } from '@/widgets/Mentor/StackSection';
import { StrategySection } from '@/widgets/Mentor/StrategySection';

import styles from './MentorPage.module.css';

export const MentorPage = () => {
	return (
		<Flex direction="column" className={styles.page}>
			<BannerSection />
			<StrategySection />
			<FullPathSection />
			<EducationSection />
			<AboutSection />
			<StackSection />
			<FeaturesSection />
		</Flex>
	);
};
