import React from 'react';

import { getTranslations } from 'next-intl/server';

import { i18Namespace } from '@/shared/config/i18n/i18n';
import { Header } from '@/shared/config/i18n/i18nTranslations';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';

import { AUTH_LINKS } from '../../../model/constants/headerConstants';
import styles from './HeaderAuthDesktop.module.css';

export const HeaderAuthDesktop = async () => {
	const t = await getTranslations(i18Namespace.header);

	return (
		<Flex dataTestId="HeaderAuthDesktop_Wrapper" justify="between" align="center" gap="26">
			<Button
				dataTestId="LoginButton"
				variant="link"
				className={styles['login-link']}
				size="large"
				href={AUTH_LINKS.login}
				rel="noopener noreferrer"
				target="_blank"
			>
				{t(Header.AUTH_SIGN_IN)}
			</Button>

			<Button
				dataTestId="RegisterButton"
				variant="link"
				size="large"
				className={styles['register-button']}
				href={AUTH_LINKS.register}
				rel="noopener noreferrer"
				target="_blank"
			>
				{t(Header.AUTH_SIGN_UP)}
			</Button>
		</Flex>
	);
};
