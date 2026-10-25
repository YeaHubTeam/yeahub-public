import { Flex } from '@/shared/ui/Flex';

import { AboutSection } from '../AboutSection';
import { BannerSection } from '../BannerSection';
import { CommunitySection } from '../CommunitySection';
import { DeveloperStack } from '../DeveloperStack';
import { EducationSection } from '../EducationSection';
import { FaqSection } from '../FaqSection';
import { FeaturesSection } from '../FeaturesSection';
import { FullPathSection } from '../FullPathSection';
import { InternationalTrackSection } from '../InternationalTrackSection';
import { PracticeSection } from '../PracticeSection';
import { PricingSection } from '../PricingSection';
import { StrategySection } from '../StrategySection';
import styles from './MentorFullstackPage.module.css';

interface MentorFullstackPageProps {
	locale: string;
}

export const MentorFullstackPage = ({ locale }: MentorFullstackPageProps) => {
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
			<CommunitySection />
			<FaqSection />
			<FeaturesSection locale={locale} />
			<InternationalTrackSection />
		</Flex>
	);
};
