import { Flex } from '@/shared/ui/Flex';
import { Indicator } from '@/shared/ui/Indicator';
import { Text } from '@/shared/ui/Text';

interface SectionHeaderLabelProps {
	text: string;
}

export const SectionHeaderLabel = ({ text }: SectionHeaderLabelProps) => {
	return (
		<Flex align="center" gap="16">
			<Indicator />
			<Text variant="body3">{text}</Text>
		</Flex>
	);
};
