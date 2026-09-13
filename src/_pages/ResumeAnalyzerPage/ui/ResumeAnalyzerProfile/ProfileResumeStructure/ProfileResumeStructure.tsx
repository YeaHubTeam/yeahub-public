import { useTranslations } from 'next-intl';

import { ResumeAnalysis } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';

import { ComparisonList } from '../../ComparisonList/ComparisonList';
import styles from './ProfileResumeStructure.module.css';

interface ProfileResumeStructureProps {
	profile: ResumeAnalysis['profile'];
}

export const ProfileResumeStructure = ({ profile }: ProfileResumeStructureProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	return (
		<Card
			size="small"
			withOutsideShadow
			className={styles.card}
			contentClassName={styles.content}
			title={t(Vacancies.RESUME_ANALYZER_PROFILE_STRUCTURE)}
		>
			<Flex direction="column" align="start" gap="20">
				{profile.presentSections.length > 0 && (
					<ComparisonList
						title={t(Vacancies.RESUME_ANALYZER_PROFILE_STRUCTURE_MATCHED)}
						variant="success"
						items={profile.presentSections}
					/>
				)}

				{profile.missingSections.length > 0 && (
					<ComparisonList
						title={t(Vacancies.RESUME_ANALYZER_PROFILE_STRUCTURE_MISSING)}
						variant="error"
						items={profile.missingSections}
					/>
				)}
			</Flex>
		</Card>
	);
};
