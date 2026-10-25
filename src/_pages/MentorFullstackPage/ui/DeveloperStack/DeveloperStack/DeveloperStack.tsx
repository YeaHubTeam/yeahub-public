import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../SectionHeader';
import { DeveloperStackLayout } from '../DeveloperStackLayout/DeveloperStackLayout';
import styles from './DeveloperStack.module.css';

export const DeveloperStack = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<section className={styles.section}>
			<SectionHeader
				label={t(MentorFullstack.DEVELOPER_STACK_LABEL)}
				title={t(MentorFullstack.DEVELOPER_STACK_TITLE)}
				description={t(MentorFullstack.DEVELOPER_STACK_DESCRIPTION)}
				descriptionStyles={styles.description}
				titleStyles={styles.title}
			/>
			<DeveloperStackLayout />
		</section>
	);
};
