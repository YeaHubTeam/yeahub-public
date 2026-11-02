import { useTranslations } from 'next-intl';

import { MentorWorldwide, i18Namespace } from '@/shared/config';
import { Text } from '@/shared/ui/Text';

import styles from './BannerDescription.module.css';

export const BannerDescription = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<Text variant="body3-accent" color="white-900" className={styles.description}>
			{t(MentorWorldwide.BANNER_DESCRIPTION)}
		</Text>
	);
};
