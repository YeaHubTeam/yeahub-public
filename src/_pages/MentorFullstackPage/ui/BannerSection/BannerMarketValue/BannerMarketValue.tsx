import classNames from 'classnames';

import { Pallete } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './BannerMarketValue.module.css';

interface BannerMarketValueProps {
	label: string;
	value: string;
	valueColor: Pallete;
	variant: 'frontend' | 'fullstack';
}

export const BannerMarketValue = ({
	label,
	value,
	valueColor,
	variant,
}: BannerMarketValueProps) => {
	return (
		<Flex direction="column" gap="8" className={styles.market}>
			<Flex justify="between" align="center" className={styles.row}>
				<Text variant="body3" color="black-400" className={styles.label}>
					{label}
				</Text>
				<Text variant="body3-strong" color={valueColor} className={styles.value}>
					{value}
				</Text>
			</Flex>
			<div className={styles.track}>
				<span className={classNames(styles.fill, styles[variant])} />
			</div>
		</Flex>
	);
};
