import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Text } from '@/shared/ui/Text';

import styles from './BannerDescription.module.css';

export const BannerDescription = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<Text variant="body3-accent" className={styles.description}>
			{t(Mentor.BANNER_DESCRIPTION)}
		</Text>
	);
};
