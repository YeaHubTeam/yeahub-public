import classNames from 'classnames';

import { IconSkeleton } from '@/shared/ui/Icon';
import { TextSkeleton } from '@/shared/ui/Text';

import { AccordionProps } from './Accordion';
import styles from './Accordion.module.css';

export const AccordionSkeleton = ({ className }: Partial<AccordionProps>) => {
	return (
		<details className={classNames(styles.accordion, className)}>
			<summary className={styles.heading}>
				<TextSkeleton
					width="70%"
					variant="body5-accent"
					className={classNames(styles.title, styles.skeleton)}
				/>
				<IconSkeleton size={24} className={styles.icon} />
			</summary>
		</details>
	);
};
