'use client';

import { useTranslations } from 'next-intl';

import { Auth, ROUTES, i18Namespace } from '@/shared/config';
import { useRouter } from '@/shared/config/navigation';
import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/Text';

import styles from './LoginLabel.module.css';

export const LoginLabel = () => {
	const router = useRouter();
	const t = useTranslations(i18Namespace.auth);
	const handleClickNavigation = () => {
		router.push(ROUTES.auth.login.page);
	};
	return (
		<div className={styles.wrapper}>
			<Text variant="body2">{t(Auth.REGISTRATION_HAVE_ACCOUNT)}</Text>
			<Button className={styles.btn} variant="link" onClick={handleClickNavigation}>
				{t(Auth.REGISTRATION_LOGIN_LINK)}
			</Button>
		</div>
	);
};
