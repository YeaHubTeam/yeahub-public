import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { ROUTES } from '@/shared/config';
import { Button } from '@/shared/ui/Button';

import styles from './BannerButton.module.css';

export const BannerButton = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<Button
			size="large"
			variant="primary"
			className={styles['banner-button']}
			href={ROUTES.mentor.telegram}
			target="_blank"
			rel="noopener noreferrer"
		>
			{t(Mentor.BANNER_BUTTON)}
		</Button>
	);
};
