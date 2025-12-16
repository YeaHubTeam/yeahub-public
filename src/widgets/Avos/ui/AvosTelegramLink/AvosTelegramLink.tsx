'use client';

import { useTranslations } from 'next-intl';

import { Avos, i18Namespace } from '@/shared/config';
import { AVOS_TELEGRAM_URL } from '@/shared/libs';
import { Button } from '@/shared/ui/Button';

import styles from './AvosTelegramLink.module.css';

export const AvosTelegramLink = () => {
	const t = useTranslations(i18Namespace.avos);
	const openTelegram = () => window.open(AVOS_TELEGRAM_URL, '_blank');

	return (
		<Button size="large" className={styles.button} onClick={openTelegram}>
			{t(Avos.AVOS_PROMO_JOIN_PRICE)}
		</Button>
	);
};
