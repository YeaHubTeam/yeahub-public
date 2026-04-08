import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './SectionHeaderLabel.module.css';

interface SectionHeaderLabelProps {
	text: string;
}

export const SectionHeaderLabel = ({ text }: SectionHeaderLabelProps) => {
	return (
		<Flex align="center" gap="16">
			<span className={styles.dot} />
			<Text variant="body3">{text}</Text>
		</Flex>
	);
};
