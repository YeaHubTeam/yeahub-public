'use client';

import { useTranslations } from 'next-intl';

import { Auth, ROUTES, i18Namespace } from '@/shared/config';
import { useRouter } from '@/shared/config/navigation';
import { Button } from '@/shared/ui/Button';

import styles from './RegistrationLabel.module.css';

export const RegistrationLabel = () => {
	const router = useRouter();
	const t = useTranslations(i18Namespace.auth);

	const handleClickNavigation = () => {
		router.push(ROUTES.auth.register.page);
	};

	return (
		<div className={styles.wrapper}>
			<p>{t(Auth.LOGIN_NO_ACCOUNT)}</p>
			<Button className={styles.btn} variant="link" onClick={handleClickNavigation}>
				{t(Auth.LOGIN_REGISTER_LINK)}
			</Button>
		</div>
	);
};
