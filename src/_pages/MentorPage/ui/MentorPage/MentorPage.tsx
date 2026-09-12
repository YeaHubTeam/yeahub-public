import { Flex } from '@/shared/ui/Flex';

import { AboutSection } from '../AboutSection';
import { BannerSection } from '../BannerSection';
import { CommunitySection } from '../CommunitySection';
import { EducationSection } from '../EducationSection';
import { FaqSection } from '../FaqSection';
import { FeaturesSection } from '../FeaturesSection';
import { FullPathSection } from '../FullPathSection';
import { InternshipSection } from '../InternshipSection';
import { PricingSection } from '../PricingSection';
import { StackSection } from '../StackSection';
import { StrategySection } from '../StrategySection';
import { TagsCloud } from '../TagsCloud';
import styles from './MentorPage.module.css';

interface MentorPageProps {
	locale: string;
}

export const MentorPage = ({ locale }: MentorPageProps) => {
	return (
		<Flex direction="column" className={styles.page}>
			<BannerSection />
			<StrategySection />
			<FullPathSection />
			<InternshipSection locale={locale} />
			<EducationSection />
			<AboutSection />
			<StackSection />
			<PricingSection />
			<CommunitySection />
			<FaqSection />
			<FeaturesSection locale={locale} />
			<TagsCloud />
		</Flex>
	);
};
