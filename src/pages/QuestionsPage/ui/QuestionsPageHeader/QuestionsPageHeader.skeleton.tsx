import { Flex } from '@/shared/ui/Flex';
import { IconSkeleton } from '@/shared/ui/Icon';
import { TextSkeleton } from '@/shared/ui/Text';

import styles from './QuestionsPageHeader.module.css';

export const QuestionsPageHeaderSkeleton = () => {
	return (
		<>
			<Flex align="center" justify="between" className={styles.header}>
				<TextSkeleton variant="body6" width={300} />
				<IconSkeleton size={32} />
			</Flex>
			<hr className={styles.divider} />
		</>
	);
};
