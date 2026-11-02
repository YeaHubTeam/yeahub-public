import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';
import { Text } from '@/shared/ui/Text';

import styles from './BannerTitle.module.css';

export const BannerTitle = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	return (
		<Text variant="head1" isMainTitle className={`${styles.title} ${styles['title-text']}`}>
			{t(MentorFullstack.BANNER_TITLE)}
		</Text>
	);
};
