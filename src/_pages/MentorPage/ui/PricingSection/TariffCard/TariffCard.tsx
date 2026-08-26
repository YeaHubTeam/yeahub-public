import classNames from 'classnames';

import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import { TariffCardAdvantages } from '../TariffCardAdvantages/TariffCardAdvantages';
import { TariffCardBadge } from '../TariffCardBadge/TariffCardBadge';
import styles from './TariffCard.module.css';

export interface RateCardProps {
	label: string;
	price: string;
	note: string;
	details: string;
	features: string[];
	buttonText: string;
	isInverted: boolean;
	link: string;
}

export const TariffCard = ({
	label,
	price,
	note,
	details,
	features,
	buttonText,
	isInverted,
	link,
}: RateCardProps) => {
	return (
		<Card className={classNames(styles.card, { [styles.inverted]: isInverted })} withOutsideShadow>
			<TariffCardBadge label={label} isInverted={isInverted} />
			<Text variant="head2" className={styles.title}>
				{price}
			</Text>
			<Text variant="body3-strong" className={styles.note}>
				{note}
			</Text>
			<Text variant="body3-accent" className={styles.details}>
				{details}
			</Text>
			<TariffCardAdvantages advantages={features} isInverted={isInverted} />
			<Button
				variant="primary"
				size="large"
				fullWidth
				className={styles.button}
				href={link}
				target="_blank"
				rel="noopener noreferrer"
			>
				{buttonText}
			</Button>
		</Card>
	);
};
