import { Flex } from '../Flex';
import styles from './SectionLabel.module.css';

interface SectionLabel {
	text: string;
}

export const SectionLabel = ({ text }: SectionLabel) => {
	return (
		<Flex align="center" gap="16">
			<span className={styles.dot} />
			<h4 className={styles.label}>{text}</h4>
		</Flex>
	);
};
