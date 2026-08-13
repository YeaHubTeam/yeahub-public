import classNames from 'classnames';

import type { VacancyMarketSpecialization } from '@/entities/vacancyMarket';
import { Link } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import { VacancyMarketCardHeader } from '../VacancyMarketCardHeader/VacancyMarketCardHeader';
import { VacancyMarketKeywords } from '../VacancyMarketKeywords/VacancyMarketKeywords';
import { VacancyMarketSkills } from '../VacancyMarketSkills/VacancyMarketSkills';
import styles from './VacancyMarketCard.module.css';

interface VacancyMarketCardProps {
	specialization: VacancyMarketSpecialization;
	vacanciesCountText: string;
	topSkillsTitle: string;
	topKeywordsTitle: string;
	detailedProfileText: string;
}

export const VacancyMarketCard = ({
	specialization,
	vacanciesCountText,
	topSkillsTitle,
	topKeywordsTitle,
	detailedProfileText,
}: VacancyMarketCardProps) => {
	const hasTopSkills = specialization.topSkills.length > 0;
	const hasTopKeywords = specialization.topKeywords.length > 0;

	return (
		<Card size="small" withOutsideShadow contentClassName={styles.content} className={styles.card}>
			<VacancyMarketCardHeader name={specialization.name} vacanciesCountText={vacanciesCountText} />

			{(hasTopSkills || hasTopKeywords) && (
				<div
					className={classNames(styles.sections, {
						[styles.single]: !hasTopSkills || !hasTopKeywords,
					})}
				>
					{hasTopSkills && (
						<section className={styles.section}>
							<VacancyMarketSkills skills={specialization.topSkills} title={topSkillsTitle} />
						</section>
					)}

					{hasTopKeywords && (
						<section className={styles.section}>
							<VacancyMarketKeywords
								keywords={specialization.topKeywords}
								title={topKeywordsTitle}
							/>
						</section>
					)}
				</div>
			)}

			<Link
				href={`/vacancies-market/${specialization.specializationId}`}
				className={styles['profile-link']}
			>
				<Text variant="body3-strong" color="purple-700">
					{detailedProfileText}
				</Text>

				<Icon icon="arrowRight" size={24} color="purple-700" aria-hidden />
			</Link>
		</Card>
	);
};
