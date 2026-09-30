import type { ResumeAnalysis } from '@/entities/vacancy';
import { Flex } from '@/shared/ui/Flex';
import { ProgressBar, ProgressBarColor } from '@/shared/ui/ProgressBar';
import { Text } from '@/shared/ui/Text';

import styles from './ResumeAnalyzerSkillsCardListItem.module.css';

interface ResumeAnalyzerSkillsCardListItemProps {
	color: ProgressBarColor;
	skill: ResumeAnalysis['skills']['matchedSkills'][number];
}

export const ResumeAnalyzerSkillsCardListItem = ({
	color,
	skill,
}: ResumeAnalyzerSkillsCardListItemProps) => {
	return (
		<Flex gap="4" direction="column">
			<Flex justify="between" align="center" gap="8">
				<Text variant="body3-accent">{skill.title}</Text>
				<Text variant="body3-accent">{Math.ceil(skill.percent)}%</Text>
			</Flex>
			<ProgressBar
				className={styles.progress}
				currentCount={skill.percent}
				totalCount={100}
				variant="medium"
				color={color}
			/>
		</Flex>
	);
};
