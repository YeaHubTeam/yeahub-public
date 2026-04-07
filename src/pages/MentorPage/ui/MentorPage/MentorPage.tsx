import { Flex } from '@/shared/ui/Flex';
import { BannerBlock } from '@/widgets/Mentor/BannerBlock';
import { CommunityBlock } from '@/widgets/Mentor/CommunityBlock';
import { FullPath } from '@/widgets/Mentor/FullPath';

import styles from './MentorPage.module.css';

export const MentorPage = () => {
	return (
		<Flex direction="column" className={styles.page}>
			<BannerBlock />
			<FullPath />
			<CommunityBlock />
		</Flex>
	);
};
