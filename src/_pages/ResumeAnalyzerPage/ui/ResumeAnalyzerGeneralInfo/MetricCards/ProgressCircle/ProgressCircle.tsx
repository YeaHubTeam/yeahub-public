import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './ProgressCircle.module.css';

interface ProgressCircleProps {
	percent?: number;
	matched?: number;
	total?: number;
	priority?: number;
}

export const ProgressCircle = ({ percent, matched, total, priority }: ProgressCircleProps) => {
	const size = 99;
	const strokeWidth = 7.5;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;

	const progress = Math.min(Math.max(percent ?? priority ?? 0, 0), 100);
	const offset = circumference - (progress / 100) * circumference;

	return (
		<Flex direction="column" gap="12" align="center">
			<div className={styles.wrapper}>
				<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.circle}>
					<circle className={styles.background} cx={size / 2} cy={size / 2} r={radius} />

					<circle
						className={styles.progress}
						cx={size / 2}
						cy={size / 2}
						r={radius}
						strokeDasharray={circumference}
						strokeDashoffset={offset}
					/>
				</svg>

				<Text variant="body5" className={styles.value}>
					{Math.floor(progress)}%
				</Text>
			</div>
			<Text variant="body3" color="black-500">
				{priority ? 'Покрытие требований' : `Совпало ${matched} из ${total}`}
			</Text>
		</Flex>
	);
};
