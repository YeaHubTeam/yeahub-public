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
	data: ResumeAnalysis;
}

export const ResumeAnalyzerSkillsCard = ({ data }: ResumeAnalyzerSkillsCardProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	return (
		<Card className={classNames(styles.card)} withOutsideShadow>
			<Flex direction="column" gap="10">
				<ResumeAnalyzerSkillsCardHeader
					title={t(Vacancies.RESUME_ANALYZER_SKILLS_COVERAGE_TITLE)}
					text={t(Vacancies.RESUME_ANALYZER_SKILLS_COVERAGE_MATCHED_OVERALL, {
						matched: data.skills.totalMatched,
						total: data.skills.totalSkills,
					})}
				/>
				<Flex className={styles.flex} justify="between" gap="20">
					{data.skills.matchedSkills.length > 0 && (
						<ResumeAnalyzerSkillsCardList
							skills={data.skills.matchedSkills}
							color="purple"
							title={t(Vacancies.RESUME_ANALYZER_SKILLS_COVERAGE_MATCHED, {
								matched: data.skills.matchedSkills.length,
							})}
						/>
					)}
					{data.skills.missingSkills.length > 0 && (
						<ResumeAnalyzerSkillsCardList
							skills={data.skills.missingSkills}
							color="red"
							title={t(Vacancies.RESUME_ANALYZER_SKILLS_COVERAGE_MISSING, {
								missing: data.skills.missingSkills.length,
							})}
						/>
					)}
				</Flex>
			</Flex>
		</Card>
	);
};
