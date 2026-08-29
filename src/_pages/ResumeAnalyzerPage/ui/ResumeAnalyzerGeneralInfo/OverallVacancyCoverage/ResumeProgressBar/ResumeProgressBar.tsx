import { Text } from '@/shared/ui/Text';

import styles from './ResumeProgressBar.module.css';

interface ResumeProgressBarProps {
	value: number;
}

export const ResumeProgressBar = ({ value }: ResumeProgressBarProps) => {
	return (
		<div className={styles.progress}>
			<div className={styles.track}>
				<div className={styles.fill} style={{ '--progress': `${value}%` } as React.CSSProperties} />
			</div>

			<div className={styles.labels}>
				<Text variant="body5" color="black-500">
					0%
				</Text>
				<Text variant="body5" color="black-500">
					50%
				</Text>
				<Text variant="body5" color="black-500">
					100%
				</Text>
			</div>
		</div>
	);
};
