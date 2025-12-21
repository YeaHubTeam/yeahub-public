import React, { ReactNode } from 'react';

import type { TextVariant } from '../Text/types';

export interface ChipProps {
	variant?: 'small' | 'big';
	theme?: 'primary' | 'outlined';
	label?: string | ReactNode;
	labelVariant?: TextVariant;
	onDelete?: () => void;
	disabled?: boolean;
	active?: boolean;
	prefix?: ReactNode;
	onClick?: () => void;
	className?: string;
	style?: React.CSSProperties;
	withText?: number | string;
}
