import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { Text } from '@/shared/ui/Text';

import styles from './BlockDescription.module.css';

export const BlockDescription = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<Text className={styles.description} variant="body6" color="white-900">
			{t(Landing.BANNER_DESCRIPTION)}
		</Text>
	);
};
