import { useTranslations } from 'next-intl';

import { ResumeAnalysis } from '@/entities/vacancy';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { StatusChip } from '@/shared/ui/StatusChip';
import { Text } from '@/shared/ui/Text';

interface ResumeAnalyzerSkillsCardHeaderProps {
	skills: ResumeAnalysis['skills'];
}

export const ResumeAnalyzerSkillsCardHeader = ({ skills }: ResumeAnalyzerSkillsCardHeaderProps) => {
	const t = useTranslations(i18Namespace.vacancies);

	return (
		<Flex gap="12" align="center">
			<Text variant="body6">{t(Vacancies.RESUME_ANALYZER_SKILLS_COVERAGE_TITLE)}</Text>
			<StatusChip
				size="medium"
				status={{
					variant: 'purple',
					text: t(Vacancies.RESUME_ANALYZER_SKILLS_COVERAGE_MATCHED_OVERALL, {
						matched: skills.totalMatched,
						total: skills.totalSkills,
					}),
				}}
			/>
		</Flex>
	);
};
