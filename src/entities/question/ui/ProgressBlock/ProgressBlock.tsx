import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './ProgressBlock.module.css';

interface ProgressBlockProps {
	checksCount?: number;
	className?: string;
}

const QUESTION_PROGRESS_COUNT = 3;
const bars = Array.from({ length: QUESTION_PROGRESS_COUNT }, (_, i) => i + 1);

export const ProgressBlock = ({ checksCount = 0, className }: ProgressBlockProps) => {
	const t = useTranslations(i18Namespace.questions);

	const classNamesRow = (bar: number) =>
		classNames(styles['progress-bar-item'], {
			[styles['progress-bar-item-large']]: bar === checksCount,
			[styles['progress-bar-item-checked']]: bar <= checksCount,
		});

	return (
		<Card withOutsideShadow className={className}>
			<Flex direction="column" gap="16">
				<Text variant="body5-accent" color="black-800">
					{t('progress.title')}
				</Text>
				<Text variant="body1-accent" color="black-400">
					{t('progress.description', { count: checksCount })}
				</Text>
			</Flex>
			<div
				className={styles['progress-bar-wrapper']}
				role="progressbar"
				aria-label={t('progress.title')}
				aria-valuemin={0}
				aria-valuemax={3}
				aria-valuenow={Math.min(checksCount, 3)}
			>
				{bars.map((bar) => (
					<span key={bar} className={classNamesRow(bar)}></span>
				))}
			</div>
		</Card>
	);
};
