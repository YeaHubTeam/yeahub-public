import { Flex } from '@/shared/ui/Flex';
import { FullPath } from '@/widgets/Mentor/FullPath';

import styles from './MentorPage.module.css';

export const MentorPage = () => {
	return (
		<Flex direction="column" className={styles.page}>
			<FullPath />
		</Flex>
	);
};
