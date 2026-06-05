import { ReactNode } from 'react';

import Link from 'next/link';

import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './SectionWrapper.module.css';

interface SectionWrapperProps {
	actionTitle?: string;
	actionRoute?: string;
	title: string;
	children: ReactNode;
}

export const SectionWrapper = ({
	actionTitle,
	actionRoute,
	title,
	children,
}: SectionWrapperProps) => {
	const t = useTranslations(i18Namespace.specialization);

	return (
		<section className={styles.wrapper}>
			<Text variant="head2" className={styles.title}>
				{t(title).toUpperCase()}
			</Text>
			<div>
				{actionTitle && actionRoute && (
					<Link href={actionRoute} className={styles.link}>
						{t(actionTitle)}
						<Icon icon="arrowRight" size={24} />
					</Link>
				)}
			</div>
			{children}
		</section>
	);
};
