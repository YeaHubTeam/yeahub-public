import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Indicator } from '@/shared/ui/Indicator';
import { Text } from '@/shared/ui/Text';

import styles from './DifficultyCard.module.css';

interface DifficultyCardProps {
	title: string;
	description: string;
}

export const DifficultyCard = ({ title, description }: DifficultyCardProps) => {
	return (
		<Card withOutsideShadow className={styles.card}>
			<Flex direction="column" gap="24">
				<Indicator className={styles.indicator} />
				<Flex direction="column" gap="8">
					<Text variant="body6" className={styles.title}>
						{title}
					</Text>
					<Text variant="body3-accent">{description}</Text>
				</Flex>
			</Flex>
		</Card>
	);
};
