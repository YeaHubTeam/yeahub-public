import { Flex } from '@/shared/ui/Flex';

import { BannerSection } from '../BannerSection';
import { EducationSection } from '../EducationSection';
import { MarketSection } from '../MarketSection';
import { PricingSection } from '../PricingSection';
import { StrategySection } from '../StrategySection';
import styles from './MentorWorldwidePage.module.css';

export const MentorWorldwidePage = () => {
	return (
		<Flex direction="column" className={styles.page}>
			<BannerSection />
			<StrategySection />
			<MarketSection />
			<EducationSection />
			<PricingSection />
		</Flex>
	);
};
