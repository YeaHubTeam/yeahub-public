import { Flex } from '@/shared/ui/Flex';
import { TextSkeleton } from '@/shared/ui/Text';

import styles from './ArticlesPageHeader.module.css';

export const ArticlesPageHeaderSkeleton = () => {
	return (
		<Flex direction="column" gap="8" className={styles.container}>
			<TextSkeleton variant="head2" width={180} />
			<TextSkeleton variant="body3-accent" width={320} className={styles.subtitle} />
		</Flex>
	);
};
