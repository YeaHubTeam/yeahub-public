import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { Text } from '@/shared/ui/Text';

import styles from './BlockTitle.module.css';

export const BlockTitle = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<Text variant="head2" color="white-900" isMainTitle className={styles.title}>
			{t(Landing.BANNER_TITLE)}
		</Text>
	);
};
