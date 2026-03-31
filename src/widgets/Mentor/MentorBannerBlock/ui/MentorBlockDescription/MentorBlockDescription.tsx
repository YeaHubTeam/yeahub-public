import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Text } from '@/shared/ui/Text';

import styles from './MentorBlockDescription.module.css';

export const MentorBlockDescription = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<Text variant="body3-accent" className={styles.description}>
			{t(Mentor.BANNER_DESCRIPTION)}
		</Text>
	);
};
