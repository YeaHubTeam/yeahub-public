import { useTranslations } from 'next-intl';

import { ResumeAnalysis } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';

import { ComparisonList } from '../../ComparisonList/ComparisonList';
import styles from './ProfileStack.module.css';

interface ProfileStackProps {
	profile: ResumeAnalysis['profile'];
}

export const ProfileStack = ({ profile }: ProfileStackProps) => {
	const t = useTranslations(i18Namespace.vacancies);
	const isStackMatched = profile.hasStackSection;

	return (
		<Card
			size="small"
			withOutsideShadow
			className={styles.card}
			contentClassName={styles.content}
			title={t(Vacancies.RESUME_ANALYZER_PROFILE_STACK)}
		>
			<ComparisonList
				title={t(
					isStackMatched
						? Vacancies.RESUME_ANALYZER_PROFILE_STACK_SUBTITLE_MATCHED
						: Vacancies.RESUME_ANALYZER_PROFILE_STACK_SUBTITLE_MISSING,
				)}
				description={t(
					isStackMatched
						? Vacancies.RESUME_ANALYZER_PROFILE_STACK_DESCRIPTION_MATCHED
						: Vacancies.RESUME_ANALYZER_PROFILE_STACK_DESCRIPTION_MISSING,
				)}
				variant={isStackMatched ? 'success' : 'error'}
				items={[
					{
						title: isStackMatched
							? t(Vacancies.RESUME_ANALYZER_PROFILE_STACK_RESULT_MATCHED)
							: t(Vacancies.RESUME_ANALYZER_PROFILE_STACK_RESULT_MISSING),
						evidence: '',
					},
				]}
			/>
		</Card>
	);
};
