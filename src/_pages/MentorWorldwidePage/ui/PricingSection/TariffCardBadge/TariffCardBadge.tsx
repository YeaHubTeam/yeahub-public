import classNames from 'classnames';

import { Chip } from '@/shared/ui/Chip';

import styles from './TariffCardBadge.module.css';

interface TariffCardBadgeProps {
	label: string;
	isInverted: boolean;
}

export const TariffCardBadge = ({ label, isInverted }: TariffCardBadgeProps) => {
	return (
		<Chip
			disablePointer
			label={label}
			className={classNames(styles.chip, { [styles.inverted]: isInverted })}
		/>
	);
};
