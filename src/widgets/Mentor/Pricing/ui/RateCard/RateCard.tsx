import classNames from 'classnames';

import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './RateCard.module.css';

export interface RateCardProps {
	label: string;
	price: string;
	note: string;
	details?: string;
	features: string[];
	buttonText: string;
	featured?: boolean;
}

export const RateCard = ({
	label,
	price,
	note,
	details,
	features,
	buttonText,
	featured = false,
}: RateCardProps) => {
	return (
		<div className={styles['card-wrapper']}>
			<Card className={classNames(styles.card, { [styles.featured]: featured })} withOutsideShadow>
				<div className={styles['card-top']}>
					<Text variant="body5-accent" color="black-900" className={styles.label}>
						{label}
					</Text>
					<Text variant="head2" className={styles.title}>
						{price}
					</Text>
					<Text variant="body3-strong" className={styles.note}>
						{note}
					</Text>
					{details ? (
						<Text variant="body3" className={styles.details}>
							{details}
						</Text>
					) : null}
				</div>
				<div className={styles['card-body']}>
					<div className={styles['card-panel']}>
						<ul className={styles.list}>
							{features.map((feature) => (
								<li key={feature} className={styles['list-item']}>
									<Text variant="body3" className={styles['list-item-text']}>
										{feature}
									</Text>
								</li>
							))}
						</ul>
					</div>
					<Flex className={styles['button-wrapper']}>
						<Button variant="primary" size="medium" fullWidth className={styles.button}>
							{buttonText}
						</Button>
					</Flex>
				</div>
			</Card>
		</div>
	);
};
