import classNames from 'classnames';

import { Pallete } from '@/shared/libs';
import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import { BannerAdvantageList } from '../BannerAdvantageList/BannerAdvantageList';
import { BannerMarketValue } from '../BannerMarketValue/BannerMarketValue';
import styles from './BannerAdvantageCard.module.css';

export type BannerAdvantageVariant = 'frontend' | 'fullstack';

interface BannerAdvantageCardProps {
	variant: BannerAdvantageVariant;
	title: string;
	items: string[];
	marketLabel: string;
	value: string;
}

const valueColor: Record<BannerAdvantageVariant, Pallete> = {
	frontend: 'black-400',
	fullstack: 'purple-700',
};

export const BannerAdvantageCard = ({
	variant,
	title,
	items,
	marketLabel,
	value,
}: BannerAdvantageCardProps) => {
	const isFullstack = variant === 'fullstack';

	return (
		<Card
			className={classNames(styles.card, { [styles.accent]: isFullstack })}
			contentClassName={styles.body}
		>
			<Text variant="body5-accent" color="black-900" className={styles.title}>
				{title}
			</Text>
			<BannerAdvantageList items={items} />
			<BannerMarketValue
				label={marketLabel}
				value={value}
				valueColor={valueColor[variant]}
				variant={variant}
			/>
		</Card>
	);
};
