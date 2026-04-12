import { Flex } from '../Flex';
import { Text } from '../Text';
import styles from './SectionLabel.module.css';

interface SectionLabel {
	text: string;
}

export const SectionLabel = ({ text }: SectionLabel) => {
	return (
		<Flex align="center" gap="16">
			<span className={styles.dot} />
			<Text className={styles.label} variant="body3" color="black-900">
				{text}
			</Text>
		</Flex>
	);
};
