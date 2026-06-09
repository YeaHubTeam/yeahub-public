import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './DifficultyHeader.module.css';

interface DifficultyHeaderProps {
	title: string;
	description: string;
}

export const DifficultyHeader = ({ title, description }: DifficultyHeaderProps) => {
	return (
		<Flex direction="column" gap="8" className={styles.title}>
			<Text variant="body5-accent">{title.toLocaleUpperCase()}</Text>
			<Text variant="body3-accent">{description}</Text>
		</Flex>
	);
};
