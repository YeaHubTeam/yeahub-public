import classNames from 'classnames';

import { Flex } from '@/shared/ui/Flex';
import { statusChipTestIds, statusChipVariants } from '@/shared/ui/StatusChip/constants';
import { Text } from '@/shared/ui/Text';
import { TextVariant } from '@/shared/ui/Text/types';

import styles from './StatusChip.module.css';

export type StatusChipVariant = 'green' | 'yellow' | 'red' | 'purple';
export type StatusChipSize = 'small' | 'medium';

export interface StatusChipItem {
	text: string;
	variant: StatusChipVariant;
}

export interface StatusChipProps {
	status: StatusChipItem;
	size?: StatusChipSize;
}

export const StatusChip = ({ status, size = 'small' }: StatusChipProps) => {
	const { variant, text } = status;

	const textSize: Record<StatusChipSize, TextVariant> = {
		medium: 'body3-strong',
		small: 'body1-accent',
	};

	return (
		<Flex
			justify="center"
			align="center"
			dataTestId={statusChipTestIds.statusChip}
			className={classNames(styles.wrapper, styles[`variant-${variant}`], styles[`size-${size}`])}
		>
			<Text
				dataTestId={statusChipTestIds.statusChipText}
				variant={textSize[size]}
				color={statusChipVariants[variant]}
			>
				{text}
			</Text>
		</Flex>
	);
};
