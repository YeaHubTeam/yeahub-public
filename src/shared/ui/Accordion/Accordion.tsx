import { ReactNode } from 'react';

import classNames from 'classnames';

import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './Accordion.module.css';

interface AccordionProps {
	title: string;
	children: ReactNode;
	className?: string;
	titleVariant?: 'body3-accent' | 'body5-accent';
}

export const Accordion = ({
	title,
	children,
	className,
	titleVariant = 'body5-accent',
}: AccordionProps) => {
	return (
		<details className={classNames(styles.accordion, className)}>
			<summary className={styles.heading}>
				<Text variant={titleVariant} className={styles.title}>
					{title}
				</Text>
				<Icon icon="arrowShortDown" size={24} color="purple-700" className={styles.icon} />
			</summary>

			<div className={styles['content-wrapper']}>
				<div className={styles.content}>{children}</div>
			</div>
		</details>
	);
};
