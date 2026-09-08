import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import type { ResumeAnalysis } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';

import styles from './ResumeAnalyzerSkillsCard.module.css';
import { ResumeAnalyzerSkillsCardHeader } from './ResumeAnalyzerSkillsCardHeader/ResumeAnalyzerSkillsCardHeader';
import { ResumeAnalyzerSkillsCardList } from './ResumeAnalyzerSkillsCardList/ResumeAnalyzerSkillsCardList';

interface ResumeAnalyzerSkillsCardProps {
	skills: ResumeAnalysis['skills'];
}

export const ResumeAnalyzerSkillsCard = ({ skills }: ResumeAnalyzerSkillsCardProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	return (
		<Card className={classNames(styles.card)} withOutsideShadow>
			<Flex direction="column" gap="20">
				<ResumeAnalyzerSkillsCardHeader skills={skills} />
				<Flex className={styles.flex} justify="between" gap="20">
					{skills.matchedSkills.length > 0 && (
						<ResumeAnalyzerSkillsCardList
							skills={skills.matchedSkills}
							color="purple"
							title={t(Vacancies.RESUME_ANALYZER_SKILLS_COVERAGE_MATCHED, {
								matched: skills.matchedSkills.length,
							})}
						/>
					)}
					{skills.missingSkills.length > 0 && (
						<ResumeAnalyzerSkillsCardList
							skills={skills.missingSkills}
							color="red"
							title={t(Vacancies.RESUME_ANALYZER_SKILLS_COVERAGE_MISSING, {
								missing: skills.missingSkills.length,
							})}
						/>
					)}
				</Flex>
			</Flex>
		</Card>
	);
};
