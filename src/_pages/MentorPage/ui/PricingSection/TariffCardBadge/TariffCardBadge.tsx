import classNames from 'classnames';

import { Text } from '@/shared/ui/Text';

import styles from './TariffCardBadge.module.css';

interface TariffCardBadgeProps {
	label: string;
	isInverted: boolean;
}

export const TariffCardBadge = ({ label, isInverted }: TariffCardBadgeProps) => {
	return (
		<Text
			variant="body5-accent"
			color="black-900"
			className={classNames(styles.label, { [styles.inverted]: isInverted })}
		>
			{label}
		</Text>
	);
};
