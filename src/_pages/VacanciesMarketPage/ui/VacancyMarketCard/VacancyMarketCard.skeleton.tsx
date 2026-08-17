import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Skeleton } from '@/shared/ui/Skeleton';
import { TextSkeleton } from '@/shared/ui/Text';

import { VacancyMarketKeywordsSkeleton } from '../VacancyMarketKeywords/VacancyMarketKeywords.skeleton';
import { VacancyMarketSkillsSkeleton } from '../VacancyMarketSkills/VacancyMarketSkills.skeleton';
import styles from './VacancyMarketCard.module.css';

export const VacancyMarketCardSkeleton = () => {
	return (
		<Card
			size="small"
			withOutsideShadow
			className={styles.card}
			contentClassName={styles.content}
			titleComponent={
				<Flex direction="column" gap="4">
					<TextSkeleton variant="body6" width={250} />
					<TextSkeleton variant="body5-accent" width={120} />
				</Flex>
			}
		>
			<div className={styles.sections}>
				<VacancyMarketSkillsSkeleton />
				<VacancyMarketKeywordsSkeleton />
			</div>

			<Flex justify="end" style={{ marginTop: 'auto' }}>
				<Skeleton width={190} height={24} borderRadius={4} />
			</Flex>
		</Card>
	);
};
