import classnames from 'classnames';

import styles from '@/shared/ui/Button/Button.module.css';
import { Skeleton } from '@/shared/ui/Skeleton';

import { getStylePrefix } from './helpers';
import { ButtonProps } from './types';

export const ButtonSkeleton = ({
	dataTestId,
	className,
	variant = 'primary',
	fullWidth,
	size = 'medium',
	destructive,
	width,
}: ButtonProps & { width?: number }) => {
	const stylePrefix = getStylePrefix(variant);

	return (
		<Skeleton
			dataTestId={dataTestId}
			borderRadius={12}
			width={width}
			className={classnames(
				styles[stylePrefix],
				styles[`${stylePrefix}-${size}`],
				fullWidth && styles[`${stylePrefix}-full`],
				destructive && stylePrefix === 'a'
					? styles['a-link-destructive']
					: styles[`${stylePrefix}-${variant}`],
				className,
			)}
		/>
	);
};
