import classNames from 'classnames';

import { Skeleton } from '@/shared/ui/Skeleton';

import styles from './AvosTelegramLink.module.css';

export const AvosTelegramLinkSkeleton = () => {
	return (
		<Skeleton
			height={48}
			className={classNames(styles.button, styles['button-skeleton'])}
			borderRadius="8px"
		/>
	);
};
