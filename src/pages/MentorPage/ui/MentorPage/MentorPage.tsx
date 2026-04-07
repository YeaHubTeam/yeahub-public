import { Flex } from '@/shared/ui/Flex';
import { BannerSection } from '@/widgets/Mentor/BannerSection';
import { EducationSection } from '@/widgets/Mentor/EducationSection';
import { FullPathSection } from '@/widgets/Mentor/FullPathSection';

import styles from './MentorPage.module.css';

export const MentorPage = () => {
	return (
		<Flex direction="column" className={styles.page}>
			<BannerSection />
			<FullPathSection />
			<EducationSection />
		</Flex>
	);
};
