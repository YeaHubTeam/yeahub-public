import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import styles from './CommunityCard.module.css';

interface CommunityCardProps {
	title: string;
	description: string;
	linkText: string;
	linkUrl: string;
}

export const CommunityCard = ({ title, description, linkText, linkUrl }: CommunityCardProps) => {
	return (
		<Card
			className={styles.card}
			contentClassName={styles['card-content']}
			actionTitle={linkText}
			actionRoute={linkUrl}
			actionPositionX="start"
			isActionPositionBottom
		>
			<Badge icon="lightning" wrapperClassName={styles['icon-wrapper']} className={styles.icon} />
			<Text variant="head3" className={styles.title}>
				{title}
			</Text>
			<Text variant="body3-accent">{description}</Text>
		</Card>
	);
};
