import classNames from 'classnames';

import { Flex } from '@/shared/ui/Flex';
import { statusChipTestIds, statusChipVariants } from '@/shared/ui/StatusChip/constants';
import { Text } from '@/shared/ui/Text';
import { TextVariant } from '@/shared/ui/Text/types';

import styles from './StatusChip.module.css';

export type StatusChipVariant = 'green' | 'yellow' | 'red' | 'purple';
export type StatusChipSize = 'small' | 'medium' | 'large';

export interface StatusChipItem {
	text: string;
	variant: StatusChipVariant;
}

export interface StatusChipProps {
	status: StatusChipItem;
	size?: StatusChipSize;
	onClick?: () => void;
	isActive?: boolean;
}

export const StatusChip = ({ status, size = 'small', onClick, isActive }: StatusChipProps) => {
	const { variant, text } = status;

	const textSize: Record<StatusChipSize, TextVariant> = {
		large: 'body3-strong',
		medium: 'body2-accent',
		small: 'body1-accent',
	};

	return (
		<Flex
			justify="center"
			align="center"
			dataTestId={statusChipTestIds.statusChip}
			className={classNames(styles.wrapper, styles[`variant-${variant}`], styles[`size-${size}`], {
				[styles.clickable]: !!onClick,
				[styles.active]: isActive,
			})}
			onClick={onClick}
		>
			<Text
				className={styles.text}
				dataTestId={statusChipTestIds.statusChipText}
				variant={textSize[size]}
				color={statusChipVariants[variant]}
			>
				{text}
			</Text>
		</Flex>
	);
};
