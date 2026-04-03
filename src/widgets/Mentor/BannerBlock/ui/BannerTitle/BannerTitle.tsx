import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Text } from '@/shared/ui/Text';

import styles from './BannerTitle.module.css';

export const BannerTitle = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<Text variant="head6" isMainTitle className={styles.title}>
			{t(Mentor.BANNER_TITLE)}
		</Text>
	);
};
