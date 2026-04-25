import { ReactNode } from 'react';

import classNames from 'classnames';

import styles from './Skeleton.module.css';

type SkeletonVariant = 'default' | 'blur';

interface SkeletonBlockProps {
	width?: string | number;
	height?: string | number;
	borderRadius?: string | number;
	style?: React.CSSProperties;
	className?: string;
	dataTestId?: string;
	variant?: SkeletonVariant;
	text?: ReactNode;
}

export const Skeleton = ({
	dataTestId,
	width,
	height,
	borderRadius = '8px',
	style = {},
	variant = 'default',
	className = '',
	text = '',
}: SkeletonBlockProps) => {
	return (
		<div
			data-testid={dataTestId}
			className={classNames(styles.skeleton, styles[variant], className)}
			style={{ width, height, borderRadius, ...style }}
		>
			{text}
		</div>
	);
};
