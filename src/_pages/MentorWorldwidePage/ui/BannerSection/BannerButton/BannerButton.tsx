import { useTranslations } from 'next-intl';

import { MentorWorldwide, ROUTES, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';

import styles from './BannerButton.module.css';

export const BannerButton = () => {
	const t = useTranslations(i18Namespace.mentorWorldwide);

	return (
		<Button
			size="large"
			variant="primary-inverse"
			className={styles['banner-button']}
			href={ROUTES.mentor.telegram}
			target="_blank"
			rel="noopener noreferrer"
		>
			{t(MentorWorldwide.BANNER_BUTTON)}
		</Button>
	);
};
