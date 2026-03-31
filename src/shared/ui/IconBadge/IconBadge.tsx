import classNames from 'classnames';

import { Icon } from '@/shared/ui/Icon';
import { IconName } from '@/shared/ui/Icon/types';

import styles from './IconBadge.module.css';

interface IconBadgeProps {
	icon: IconName;
	className?: string;
	iconClassName?: string;
}

export const IconBadge = ({ icon, className, iconClassName }: IconBadgeProps) => (
	<div className={classNames(styles['icon-badge'], className)} aria-hidden>
		<Icon icon={icon} color="red-600" className={iconClassName} />
	</div>
);
