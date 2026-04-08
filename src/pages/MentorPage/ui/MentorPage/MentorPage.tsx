import { Flex } from '@/shared/ui/Flex';
import { About } from '@/widgets/Mentor/About';
import { BannerSection } from '@/widgets/Mentor/BannerSection';
import { EducationSection } from '@/widgets/Mentor/EducationSection';
import { FullPathSection } from '@/widgets/Mentor/FullPathSection';
import { StrategySection } from '@/widgets/Mentor/StrategySection';

import styles from './MentorPage.module.css';

export const MentorPage = () => {
	return (
		<Flex direction="column" className={styles.page}>
			<BannerSection />
			<StrategySection />
			<FullPathSection />
			<EducationSection />
			<About />
		</Flex>
	);
};
