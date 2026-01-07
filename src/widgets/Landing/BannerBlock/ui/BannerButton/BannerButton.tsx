'use client';

import { useTranslations } from 'next-intl';

import { Landing, ROUTES, i18Namespace, useRouter } from '@/shared/config';
import { Button } from '@/shared/ui/Button';

import styles from './BannerButton.module.css';

export const BannerButton = () => {
	const t = useTranslations(i18Namespace.landing);
	const router = useRouter();

	const handleClickNavigation = () => {
		router.push(ROUTES.login);
	};

	return (
		<Button
			size="x-large"
			variant="primary-inverse"
			className={styles['banner-button']}
			onClick={handleClickNavigation}
		>
			{t(Landing.BANNER_BUTTON)}
		</Button>
	);
};
