import { Flex } from '@/shared/ui/Flex';
import { BannerBlock } from '@/widgets/Mentor/BannerBlock';
import { FeaturesSection } from '@/widgets/Mentor/FeaturesSection';
import { FullPath } from '@/widgets/Mentor/FullPath';

import styles from './MentorPage.module.css';

export const MentorPage = () => {
	return (
		<Flex direction="column" className={styles.page}>
			<BannerBlock />
			<FullPath />
			<FeaturesSection />
		</Flex>
	);
};
