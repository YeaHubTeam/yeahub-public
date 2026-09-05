import { Flex } from '@/shared/ui/Flex';
import { StatusChip } from '@/shared/ui/StatusChip';
import { Text } from '@/shared/ui/Text';

import styles from './ResumeAnalyzerSkillsCardHeader.module.css';

interface ResumeAnalyzerSkillsCardHeaderProps {
	title: string;
	totalMatched: number;
	totalKeywords: number;
}

export const ResumeAnalyzerSkillsCardHeader = ({
	title,
	totalMatched,
	totalKeywords,
}: ResumeAnalyzerSkillsCardHeaderProps) => {
	return (
		<Flex className={styles.flex} gap="12">
			<Text variant="body6">{title}</Text>
			<StatusChip
				size="medium"
				status={{
					variant: 'purple',
					text: `${totalMatched}/${totalKeywords} совпало`,
				}}
			/>
		</Flex>
	);
};
