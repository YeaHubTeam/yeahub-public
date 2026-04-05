import { Flex } from '@/shared/ui/Flex';
import { About } from '@/widgets/Mentor/About';
import { BannerBlock } from '@/widgets/Mentor/BannerBlock';
import { FullPath } from '@/widgets/Mentor/FullPath';

import styles from './MentorPage.module.css';

export const MentorPage = () => {
	return (
		<Flex direction="column" className={styles.page}>
			<BannerBlock />
			<FullPath />
			<About />
		</Flex>
	);
};
