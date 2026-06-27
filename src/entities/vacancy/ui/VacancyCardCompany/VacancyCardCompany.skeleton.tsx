import { Flex } from '@/shared/ui/Flex';
import { ImageWithWrapperSkeleton } from '@/shared/ui/ImageWithWrapper';
import { TextSkeleton } from '@/shared/ui/Text';

import styles from './VacancyCardCompany.module.css';

export const VacancyCardCompanySkeleton = () => {
	return (
		<Flex gap="12" wrap="wrap" justify="between">
			<Flex gap="9" align="end" className={styles['company-info']}>
				<ImageWithWrapperSkeleton className={styles['image-wrapper']} />
				<TextSkeleton variant="body3-accent" className={styles['company-name']} width={100} />
			</Flex>
			<TextSkeleton variant="body5-accent" className={styles['published-date']} width={100} />
			<TextSkeleton variant="body6" className={styles.title} width={300} />
		</Flex>
	);
};
