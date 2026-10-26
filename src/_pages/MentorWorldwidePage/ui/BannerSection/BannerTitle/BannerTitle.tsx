import { useTranslations } from 'next-intl';

import { MentorWorldwide, i18Namespace } from '@/shared/config';
import { Text } from '@/shared/ui/Text';

import styles from './BannerTitle.module.css';

export const BannerTitle = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<Text variant="head1" isMainTitle color="white-900" className={styles.title}>
			{t(MentorWorldwide.BANNER_TITLE)}
		</Text>
	);
};
