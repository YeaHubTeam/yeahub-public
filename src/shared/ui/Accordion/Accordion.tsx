import { ReactNode } from 'react';

import classNames from 'classnames';

import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './Accordion.module.css';

export interface AccordionProps {
	title: string;
	children: ReactNode;
	className?: string;
	titleVariant?: 'body3-accent' | 'body5-accent' | 'body6';
	number?: string;
	variant?: 'default' | 'mentor';
	defaultOpen?: boolean;
	fixedHeight?: boolean;
	limitContent?: boolean;
	moveTitle?: boolean;
	media?: ReactNode;
	mediaClassName?: string;
}

export const Accordion = ({
	title,
	children,
	className,
	titleVariant = 'body5-accent',
	number,
	variant = 'default',
	defaultOpen = false,
	fixedHeight = false,
	limitContent = false,
	moveTitle = false,
	media,
	mediaClassName,
}: AccordionProps) => {
	const isMentor = variant === 'mentor';

	const icon = isMentor ? (
		<span className={styles.icon} />
	) : (
		<Icon icon="arrowShortDown" size={24} color="purple-700" className={styles.icon} />
	);

	return (
		<details
			className={classNames(
				styles.accordion,
				styles[variant],
				fixedHeight && styles['fixed-height'],
				limitContent && styles['limit-content'],
				moveTitle && styles['move-title'],
				className,
			)}
			open={defaultOpen}
		>
			<summary className={styles.heading}>
				{number && <span className={styles.number}>{number}</span>}
				<Text variant={titleVariant} className={styles.title}>
					{title}
				</Text>
				{icon}
			</summary>
			<div className={styles['content-wrapper']}>
				<div className={styles.content}>
					{moveTitle && (
						<Text variant={titleVariant} className={styles['content-title']}>
							{title}
						</Text>
					)}
					{children}
				</div>
				{media && <div className={classNames(styles.media, mediaClassName)}>{media}</div>}
			</div>
		</details>
	);
};
