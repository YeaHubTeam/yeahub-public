import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './BottomCommunityCard.module.css';

interface CommunityCardProps {
	title: string;
	description: string;
	linkText: string;
	linkUrl: string;
}

export const BottomCommunityCard = ({
	title,
	description,
	linkText,
	linkUrl,
}: CommunityCardProps) => {
	return (
		<Card
			className={styles.card}
			contentClassName={styles['card-content']}
			actionTitle={linkText}
			actionRoute={linkUrl}
			actionPositionX="end"
			isActionPositionBottom
			actionOptions={{
				target: '_blank',
				rel: 'noopener noreferrer',
			}}
			withOutsideShadow
		>
			<Flex gap="9">
				<Badge icon="lightning" wrapperClassName={styles['icon-wrapper']} className={styles.icon} />
				<Flex direction="column">
					<Text variant="body3-strong" className={styles.title}>
						{title}
					</Text>
					<Text variant="body3-accent">{description}</Text>
				</Flex>
			</Flex>
		</Card>
	);
};
