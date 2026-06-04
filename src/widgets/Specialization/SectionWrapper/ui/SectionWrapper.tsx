import { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';

import styles from './SectionWrapper.module.css';

interface SectionWrapperProps {
	actionTitle: string;
	actionRoute: string;
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
		<section>
			<Card
				title={t(title).toUpperCase()}
				actionTitle={t(actionTitle)}
				actionRoute={actionRoute}
				className={styles.wrapper}
			>
				{children}
			</Card>
		</section>
	);
};
