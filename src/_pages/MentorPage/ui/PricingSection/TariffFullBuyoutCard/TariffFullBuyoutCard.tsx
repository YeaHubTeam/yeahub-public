import classNames from 'classnames';

import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import { TariffCardAdvantages } from '../TariffCardAdvantages/TariffCardAdvantages';
import { TariffCardBadge } from '../TariffCardBadge/TariffCardBadge';
import styles from './TariffFullBuyoutCard.module.css';

export interface TariffFullBuyoutCardProps {
	label: string;
	price: string;
	features: string[];
	buttonText: string;
	link: string;
	promoTitle?: string;
	promoPrice?: string;
	className?: string;
}

export const TariffFullBuyoutCard = ({
	label,
	price,
	features,
	buttonText,
	link,
	promoTitle,
	promoPrice,
	className,
}: TariffFullBuyoutCardProps) => {
	return (
		<Card
			className={classNames(styles.card, { [styles.inverted]: false }, className)}
			withOutsideShadow
		>
			<div className={styles.row}>
				<div className={styles.content}>
					<TariffCardBadge label={label} isInverted={false} />
					<Text variant="head2" className={styles.title}>
						{price}
					</Text>
					<TariffCardAdvantages advantages={features} isInverted={false} />
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
				</div>
				<div className={styles.banner}>
					<Text variant="head3">{promoTitle}</Text>
					<Text variant="head3">{promoPrice}</Text>
				</div>
			</div>
		</Card>
	);
};
