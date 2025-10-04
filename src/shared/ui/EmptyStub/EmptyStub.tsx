import { Button } from '@/shared/ui/Button';
import { emptyStubTestIds } from '@/shared/ui/EmptyStub/constants';
import { Text } from '@/shared/ui/Text';

import styles from './EmptyStub.module.css';

export interface EmptyStubProps {
	text?: string;
	resetFilters?: () => void;
}

export const EmptyStub = ({ resetFilters, text }: EmptyStubProps) => {
	return (
		<>
			<Text
				dataTestId={emptyStubTestIds.emptyStubText}
				variant={'body5-accent'}
				className={styles.text}
			>
				{text ? `“${text}”` : undefined}
			</Text>
			<Button
				dataTestId={emptyStubTestIds.emptyStubButton}
				size="large"
				variant="outline"
				onClick={resetFilters}
				className={styles.button}
			>
				{'resetFilters'}
			</Button>
		</>
	);
};
