import { Flex } from '@/shared/ui/Flex';
import { TextSkeleton } from '@/shared/ui/Text';

import styles from './VacancyCardSkills.module.css';

export const VacancyCardSkillsSkeleton = () => {
	return (
		<Flex gap="10" align="center">
			<TextSkeleton variant="body1-accent" className={styles.skill} width={80} />
			<TextSkeleton variant="body1-accent" className={styles.skill} width={80} />
			<TextSkeleton variant="body1-accent" className={styles.skill} width={80} />
			<TextSkeleton variant="body1-accent" className={styles.skill} width={80} />
		</Flex>
	);
};
