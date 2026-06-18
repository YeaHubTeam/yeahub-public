import { ReactNode } from 'react';

import Link from 'next/link';

import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './SectionWrapper.module.css';

interface SectionWrapperProps {
	actionTitle?: string;
	actionRoute?: string;
	title: string;
	subtitle?: string;
	children: ReactNode;
}

export const SectionWrapper = ({
	actionTitle,
	actionRoute,
	title,
	subtitle,
	children,
}: SectionWrapperProps) => {
	return (
		<section className={styles.wrapper}>
			<Flex direction="column" gap="8">
				<Text variant="head2" className={styles.title}>
					{title.toUpperCase()}
				</Text>
				{subtitle && (
					<Text variant="body3-accent" className={styles.subtitle}>
						{subtitle}
					</Text>
				)}
			</Flex>
			<div>
				{actionTitle && actionRoute && (
					<Link href={actionRoute} className={styles.link}>
						{actionTitle}
						<Icon icon="arrowRight" size={24} />
					</Link>
				)}
			</div>
			{children}
		</section>
	);
};
