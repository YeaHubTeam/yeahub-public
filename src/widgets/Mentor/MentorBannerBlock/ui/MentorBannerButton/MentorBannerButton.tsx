'use client';

import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';

import styles from './MentorBannerButton.module.css';

export const MentorBannerButton = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<Button size="large" variant="primary" className={styles['banner-button']}>
			{t(Mentor.BANNER_BUTTON)}
		</Button>
	);
};
