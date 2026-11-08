'use client';

import { useTranslations } from 'next-intl';

import { Header, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';

import styles from './HeaderAuthDesktop.module.css';

export const HeaderAuthDesktop = ({ loginUrl = '/ru/auth/login' }: { loginUrl?: string } = {}) => {
	const t = useTranslations(i18Namespace.header);

	return (
		<Flex className={styles['auth-actions']} justify="between" align="center" gap="26">
			<Button variant="primary" size="large" className={styles['register-button']} href={loginUrl}>
				{t(Header.AUTH_SIGN_IN)}
			</Button>
		</Flex>
	);
};
