import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import styles from './PracticeCard.module.css';

interface PracticeCardProps {
	index: string;
	title: string;
	description: string;
}

export const PracticeCard = ({ index, title, description }: PracticeCardProps) => {
	return (
		<Card withOutsideShadow className={styles.card} contentClassName={styles.body}>
			<div className={styles.badge}>
				<Text variant="body3-accent" color="red-600" className={styles.index}>
					{index}
				</Text>
			</div>
			<Text variant="body5-accent" className={styles.title}>
				{title}
			</Text>
			<Text variant="body3" color="black-500" className={styles.description}>
				{description}
			</Text>
		</Card>
	);
};
