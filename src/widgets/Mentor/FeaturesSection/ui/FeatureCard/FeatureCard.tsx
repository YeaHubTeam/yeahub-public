import Image from 'next/image';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { StatusChip } from '@/shared/ui/StatusChip';
import { Text } from '@/shared/ui/Text';

import { FeatureItem } from '../../model/types/FeatureItem';
import styles from './FeatureCard.module.css';

interface FeatureCardProps {
	feature: FeatureItem;
}

export const FeatureCard = ({ feature }: FeatureCardProps) => {
	const { badge, title, description, imageSrc, link, to, isHighlighted } = feature;
	const t = useTranslations(i18Namespace.mentor);

	return (
		<Card
			withOutsideShadow
			className={styles.card}
			contentClassName={classNames(styles['card-content'], imageSrc && styles['card-with-image'])}
			actionRoute={to}
			actionTitle={t(link)}
			isActionPositionBottom
			actionPositionX="start"
		>
			<StatusChip size="medium" status={{ text: t(badge), variant: 'green' }} />
			<Flex gap="20" className={styles.row}>
				<Flex gap="8" direction="column" className={styles['text-content']}>
					<Text
						variant="body6"
						className={classNames(styles.title, isHighlighted && styles['highlighted-title'])}
					>
						{t(title)}
					</Text>
					<Text variant="body3-accent" className={styles.description}>
						{t(description)}
					</Text>
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
