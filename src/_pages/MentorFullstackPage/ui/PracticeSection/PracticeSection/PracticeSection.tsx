import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';

import { SectionHeader } from '../../SectionHeader';
import { PracticeArchitecture } from '../PracticeArchitecture/PracticeArchitecture';
import { PracticeList } from '../PracticeList/PracticeList';
import styles from './PracticeSection.module.css';

export const PracticeSection = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<section className={styles.section}>
			<SectionHeader
				label={t(MentorFullstack.PRACTICE_LABEL)}
				title={t(MentorFullstack.PRACTICE_TITLE)}
				description={t(MentorFullstack.PRACTICE_DESCRIPTION)}
				titleStyles={styles.title}
				descriptionStyles={styles.description}
			/>
			<PracticeList />
			<PracticeArchitecture />
		</section>
	);
};
