import { Flex } from '@/shared/ui/Flex';
import { StatusChip } from '@/shared/ui/StatusChip';
import { Text } from '@/shared/ui/Text';

interface ResumeAnalyzerSkillsCardHeaderProps {
	title: string;
	text: string;
}

export const ResumeAnalyzerSkillsCardHeader = ({
	title,
	text,
}: ResumeAnalyzerSkillsCardHeaderProps) => {
	return (
		<Flex gap="12" align="center">
			<Text variant="body6">{title}</Text>
			<StatusChip
				size="medium"
				status={{
					variant: 'purple',
					text: text,
				}}
			/>
		</Flex>
	);
};
