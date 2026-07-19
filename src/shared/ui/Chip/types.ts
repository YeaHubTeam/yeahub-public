import React, { ReactNode } from 'react';

import { StatusChipVariant } from '../StatusChip';
import type { TextVariant } from '../Text/types';

export interface ChipProps {
	variant?: 'small' | 'big';
	theme?: 'primary' | 'outlined' | 'accent';
	themeVariant?: StatusChipVariant;
	label?: string | ReactNode;
	labelVariant?: TextVariant;
	onDelete?: () => void;
	disablePointer?: boolean;
	disabled?: boolean;
	active?: boolean;
	prefix?: ReactNode;
	onClick?: () => void;
	className?: string;
	style?: React.CSSProperties;
	withText?: number | string;
}
