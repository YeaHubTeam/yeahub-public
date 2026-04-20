import classNames from 'classnames';

import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Indicator } from '@/shared/ui/Indicator';
import { Text } from '@/shared/ui/Text';

import styles from './TariffCardAdvantages.module.css';

interface TariffCardAdvantagesProps {
	advantages: string[];
	isInverted: boolean;
}

export const TariffCardAdvantages = ({ advantages, isInverted }: TariffCardAdvantagesProps) => {
	return (
		<Card
			withOutsideShadow
			className={classNames(styles['card-panel'], { [styles.inverted]: isInverted })}
		>
			<Flex componentType="ul" direction="column" gap="12">
				{advantages.map((advantage) => (
					<Flex
						componentType="li"
						gap="10"
						align="center"
						key={advantage}
						className={styles['list-item']}
					>
						<Indicator />
						<Text variant="body3-accent">{advantage}</Text>
					</Flex>
				))}
			</Flex>
		</Card>
	);
};
