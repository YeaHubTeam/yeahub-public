import Image from 'next/image';

import classNames from 'classnames';

import { Link } from '@/shared/config';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import { FeatureItem } from '../../model/types/FeatureItem';
import styles from './FeatureCard.module.css';

interface FeatureCardProps {
	feature: FeatureItem;
}

export const FeatureCard = ({ feature }: FeatureCardProps) => {
	const { badge, title, description, imageSrc, link, to, isHighlighted } = feature;

	return (
		<Card
			className={styles.card}
			contentClassName={classNames(styles['card-content'], imageSrc && styles['card-with-image'])}
		>
			<Badge text={badge} wrapperClassName={styles['badge-wrapper']} color="green-750" />
			<Flex gap="20" className={styles.row}>
				<Flex gap="8" direction="column" className={styles['text-content']}>
					<Text
						variant="body6"
						className={classNames(styles.title, isHighlighted && styles['highlighted-title'])}
					>
						{title}
					</Text>
					<Text variant="body3-accent" className={styles.description}>
						{description}
					</Text>
					<Link className={styles.link} href={to}>
						{link}
						<Icon icon="arrowRight" size={24} className={styles.icon} />
					</Link>
				</Flex>
				{imageSrc && (
					<div className={styles['image-wrapper']}>
						<Image src={imageSrc} alt={title} className={styles.image} />
					</div>
				)}
			</Flex>
		</Card>
	);
};
