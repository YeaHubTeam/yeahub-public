import { getLocale, getTranslations } from 'next-intl/server';

import { Header, ROUTES, i18Namespace } from '@/shared/config';
import { getPathname } from '@/shared/config/navigation';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';

import styles from './HeaderAuthDesktop.module.css';

export const HeaderAuthDesktop = async () => {
	const t = await getTranslations(i18Namespace.header);
	const locale = await getLocale();

	return (
		<Flex justify="between" align="center" gap="26">
			<Button
				variant="link"
				size="large"
				className={styles['register-button']}
				href={getPathname({ locale, href: ROUTES.auth.login.page })}
			>
				{t(Header.AUTH_SIGN_IN)}
			</Button>
		</Flex>
	);
};
