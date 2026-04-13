import classNames from 'classnames';

import { Pallete } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { IconName } from '@/shared/ui/Icon/types';
import { Text } from '@/shared/ui/Text';

import styles from './Badge.module.css';

interface BadgeProps {
	icon?: IconName;
	text?: string;
	className?: string;
	wrapperClassName?: string;
	color?: Pallete;
}

export const Badge = ({
	icon,
	text,
	className,
	wrapperClassName,
	color = 'red-600',
}: BadgeProps) => (
	<Flex
		align="center"
		justify="center"
		className={classNames(styles['icon-badge'], wrapperClassName)}
		aria-hidden
	>
		{icon ? (
			<Icon icon={icon} color="red-600" className={classNames(styles.icon, className)} />
		) : null}
		{text ? (
			<Text variant="body3-strong" color={color}>
				{text}
			</Text>
		) : null}
	</Flex>
);
