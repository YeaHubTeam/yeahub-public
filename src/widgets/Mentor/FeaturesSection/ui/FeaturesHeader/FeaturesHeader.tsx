import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './FeaturesHeader.module.css';

export const FeaturesHeader = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<div className={styles.header}>
			<Flex align="center" gap="16" className={styles['indicator-wrapper']}>
				<span className={styles.indicator}></span>
				<Text variant="body3">{t(Mentor.FEATURES_INDICATOR)}</Text>
			</Flex>
			<div className={styles.info}>
				<Text variant="head3" className={styles.title}>
					{t(Mentor.FEATURES_TITLE)}
				</Text>
				<Text variant="body3-accent" className={styles.description}>
					{t(Mentor.FEATURES_DESCRIPTION)}
				</Text>
			</div>
		</div>
	);
};
