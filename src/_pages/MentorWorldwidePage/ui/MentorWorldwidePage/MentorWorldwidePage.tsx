import { Flex } from '@/shared/ui/Flex';

import { BannerSection } from '../BannerSection';
import { EducationSection } from '../EducationSection';
import { FeaturesSection } from '../FeaturesSection';
import { MarketSection } from '../MarketSection';
import { PricingSection } from '../PricingSection';
import { ProgramsSection } from '../ProgramsSection';
import { StrategySection } from '../StrategySection';
import { TagsCloud } from '../TagsCloud';
import styles from './MentorWorldwidePage.module.css';

interface MentorWorldwidePageProps {
	locale: string;
}

export const MentorWorldwidePage = ({ locale }: MentorWorldwidePageProps) => {
	return (
		<Flex direction="column" className={styles.page}>
			<BannerSection />
			<StrategySection />
			<MarketSection />
			<EducationSection />
			<PricingSection />
			<FeaturesSection locale={locale} />
			<ProgramsSection />
			<TagsCloud />
		</Flex>
	);
};
