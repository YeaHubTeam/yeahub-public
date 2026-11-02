import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './MarketCard.module.css';

interface MarketCardProps {
	title: string;
	description: string;
}

export const MarketCard = ({ title, description }: MarketCardProps) => {
	return (
		<Card withOutsideShadow className={styles.card} contentClassName={styles.content}>
			<Badge icon="lightning" wrapperClassName={styles['icon-wrapper']} />
			<Flex direction="column" gap="8" className={styles.texts}>
				<Text variant="head3" className={styles.title}>
					{title}
				</Text>
				<Text variant="body3" className={styles.description}>
					{description}
				</Text>
			</Flex>
		</Card>
	);
};
