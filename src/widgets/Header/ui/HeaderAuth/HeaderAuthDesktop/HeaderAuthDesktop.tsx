import React from 'react';

import { getTranslations } from 'next-intl/server';

import { AUTH_LINKS, Header, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';

import styles from './HeaderAuthDesktop.module.css';

export const HeaderAuthDesktop = async () => {
	const t = await getTranslations(i18Namespace.header);

	return (
		<Flex dataTestId="HeaderAuthDesktop_Wrapper" justify="between" align="center" gap="26">
			<Button
				dataTestId="RegisterButton"
				variant="link"
				size="large"
				className={styles['register-button']}
				href={AUTH_LINKS.login}
				rel="noopener noreferrer"
				target="_blank"
			>
				{t(Header.AUTH_SIGN_IN)}
			</Button>
		</Flex>
	);
};
