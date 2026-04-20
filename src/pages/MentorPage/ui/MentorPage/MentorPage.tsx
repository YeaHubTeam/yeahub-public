import { Flex } from '@/shared/ui/Flex';
import { AboutSection } from '@/widgets/Mentor/AboutSection';
import { BannerSection } from '@/widgets/Mentor/BannerSection';
import { CommunitySection } from '@/widgets/Mentor/CommunitySection';
import { EducationSection } from '@/widgets/Mentor/EducationSection';
import { FaqSection } from '@/widgets/Mentor/FaqSection';
import { FeaturesSection } from '@/widgets/Mentor/FeaturesSection';
import { FullPathSection } from '@/widgets/Mentor/FullPathSection';
import { InternshipSection } from '@/widgets/Mentor/InternshipSection';
import { PricingSection } from '@/widgets/Mentor/PricingSection';
import { StackSection } from '@/widgets/Mentor/StackSection';
import { StrategySection } from '@/widgets/Mentor/StrategySection';

import styles from './MentorPage.module.css';

export const MentorPage = () => {
	return (
		<Flex direction="column" className={styles.page}>
			<BannerSection />
			<StrategySection />
			<FullPathSection />
			<InternshipSection />
			<EducationSection />
			<AboutSection />
			<StackSection />
			<PricingSection />
			<CommunitySection />
			<FaqSection />
			<FeaturesSection />
		</Flex>
	);
};
