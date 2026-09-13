import { useTranslations } from 'next-intl';

import { ResumeAnalysis } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';

import { ComparisonList } from '../../ComparisonList/ComparisonList';
import styles from './ProfileProjectContext.module.css';

interface ProfileProjectContextProps {
	profile: ResumeAnalysis['profile'];
}

export const ProfileProjectContext = ({ profile }: ProfileProjectContextProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	return (
		<Card
			size="small"
			withOutsideShadow
			className={styles.card}
			contentClassName={styles.content}
			title={t(Vacancies.RESUME_ANALYZER_PROFILE_CONTEXT)}
		>
			<Flex direction="column" align="start" gap="20">
				{profile.projectScopeSignals.length > 0 && (
					<ComparisonList
						title={t(Vacancies.RESUME_ANALYZER_PROFILE_MATCHED)}
						variant="success"
						items={profile.projectScopeSignals}
					/>
				)}

				{profile.missingProjectElements.length > 0 && (
					<ComparisonList
						title={t(Vacancies.RESUME_ANALYZER_PROFILE_CONTEXT_MISSING)}
						variant="error"
						items={profile.missingProjectElements}
					/>
				)}
			</Flex>
		</Card>
	);
};
