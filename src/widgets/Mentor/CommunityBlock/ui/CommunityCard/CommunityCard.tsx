import Link from 'next/link';

import { Badge } from '@/shared/ui/Badge';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './CommunityCard.module.css';

interface CommunityCardProps {
	title: string;
	description: string;
	linkText: string;
}

export const CommunityCard = ({ title, description, linkText }: CommunityCardProps) => {
	return (
		<div className={styles.card}>
			<Badge icon="lightning" wrapperClassName={styles['icon-wrapper']} className={styles.icon} />

			<Text variant="head3" className={styles.title}>
				{title}
			</Text>

			<Text variant="body3-accent">{description}</Text>

			<Link href="#" className={styles.link}>
				<Text className={styles.text} variant="body3-accent">
					{linkText}
				</Text>
				<Icon icon="arrowRight" size={24} className={styles.icon} color="purple-700" />
			</Link>
		</div>
	);
};
