import { ReactNode } from 'react';

import classNames from 'classnames';

import { Badge } from '@/shared/ui/Badge';
import { Text } from '@/shared/ui/Text';

import styles from './AccordionMentor.module.css';

export interface AccordionMentor {
	title: string;
	children: ReactNode;
	className?: string;
	number?: string;
	media?: ReactNode;
	mediaClassName?: string;
	moveTitle?: boolean;
	defaultOpen?: boolean;
}

export const AccordionMentor = ({
	title,
	children,
	className,
	number,
	media,
	mediaClassName,
	moveTitle = false,
	defaultOpen = false,
}: AccordionMentor) => {
	return (
		<details
			className={classNames(
				styles.accordion,
				moveTitle && styles['move-title'],
				(!!media || moveTitle) && styles['with-media'],
				className,
			)}
			open={defaultOpen}
		>
			<summary className={styles.heading}>
				{number && <Badge text={number} wrapperClassName={styles.number} />}
				<Text variant="head3" className={styles.title}>
					{title}
				</Text>
				<span className={styles.icon} />
			</summary>
			<div className={styles['content-wrapper']}>
				<div className={styles.content}>
					<Text variant="head3" className={styles['content-title']}>
						{title}
					</Text>
					{children}
				</div>
				{media && <div className={classNames(styles.media, mediaClassName)}>{media}</div>}
			</div>
		</details>
	);
};
