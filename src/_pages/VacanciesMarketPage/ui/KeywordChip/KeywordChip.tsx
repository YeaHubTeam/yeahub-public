import classNames from 'classnames';

import { Text } from '@/shared/ui/Text';

import styles from './KeywordChip.module.css';

export type KeywordChipVariant = 'accent' | 'default';

export interface KeywordChipProps {
	title: string;
	variant?: KeywordChipVariant;
}

export const KeywordChip = ({ title, variant = 'default' }: KeywordChipProps) => {
	return (
		<div className={classNames(styles.chip, styles[variant])}>
			<Text variant="body2" className={styles.title}>
				{title}
			</Text>
		</div>
	);
};
