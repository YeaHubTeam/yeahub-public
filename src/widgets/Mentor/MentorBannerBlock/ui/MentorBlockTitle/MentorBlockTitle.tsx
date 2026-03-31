import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Text } from '@/shared/ui/Text';

import styles from './MentorBlockTitle.module.css';

export const MentorBlockTitle = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<Text variant="head6" className={styles.title}>
			{t(Mentor.BANNER_TITLE)}
		</Text>
	);
};
