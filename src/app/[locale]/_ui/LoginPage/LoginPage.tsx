'use client';

import { useTranslations } from 'next-intl';

import { Auth, i18Namespace } from '@/shared/config';
import { LoginCreateForm } from '@/widgets/authentication/login';

import styles from './LoginPage.module.css';

const LoginPage = () => {
	const t = useTranslations(i18Namespace.auth);

	return (
		<div className={styles.wrapper}>
			<h1 className={styles.title}>{t(Auth.LOGIN_TITLE)}</h1>
			<LoginCreateForm />
		</div>
	);
};

export default LoginPage;
