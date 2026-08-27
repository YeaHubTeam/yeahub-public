import classNames from 'classnames';

import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';

import styles from './ResumeAnalyzerTasksToggle.module.css';

interface ResumeAnalyzerTasksToggleProps {
	isExpanded: boolean;
	label: string;
	onToggle: () => void;
}

export const ResumeAnalyzerTasksToggle = ({
	isExpanded,
	label,
	onToggle,
}: ResumeAnalyzerTasksToggleProps) => {
	return (
		<Button
			variant="link"
			size="large"
			onClick={onToggle}
			aria-expanded={isExpanded}
			suffix={
				<Icon
					icon="arrowShortDown"
					size={24}
					color="purple-700"
					aria-hidden
					className={classNames(styles.icon, {
						[styles.expanded]: isExpanded,
					})}
				/>
			}
		>
			{label}
		</Button>
	);
};
