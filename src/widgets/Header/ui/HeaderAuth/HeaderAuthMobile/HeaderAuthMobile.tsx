'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { AUTH_LINKS, Header, Subscription, i18Namespace } from '@/shared/config';
import { Icon } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui/IconButton';
import { Popover, PopoverMenuItem } from '@/shared/ui/Popover';
import { UserPlusIcon } from '@/widgets/Header/ui/HeaderAuth/UserPlusIcon';
import { TariffsModal } from '@/widgets/Subscription';

import styles from './HeaderAuthMobile.module.css';

export const HeaderAuthMobile = () => {
	const [isTariffsOpen, setIsTariffsOpen] = useState(false);
	const tHeader = useTranslations(i18Namespace.header);
	const tSubscription = useTranslations(i18Namespace.subscription);

	// React.useEffect(() => {
	// 	const tryRefreshToken = async () => {
	// 		try {
	// 			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/refresh`, {
	// 				method: 'GET',
	// 				credentials: 'include',
	// 			});

	// 			/* eslint-disable no-console */
	// 			console.log('[refresh-check] status:', response.status);
	// 			console.log('[refresh-check] ok:', response.ok);

	// 			const data = await response.json().catch(() => null);
	// 			console.log('[refresh-check] data:', data);

	// 			return data;
	// 		} catch (error) {
	// 			console.log('[refresh-check] error:', error);
	// 			/* eslint-enable no-console */
	// 			return null;
	// 		}
	// 	};

	// 	void tryRefreshToken();
	// }, []);

	const authMenuLinks: PopoverMenuItem[] = [
		{
			icon: <UserPlusIcon isCurrentColor />,
			title: tHeader(Header.AUTH_SIGN_IN),
			link: AUTH_LINKS.login,
		},
		{
			icon: <Icon icon="checkList" />,
			title: tSubscription(Subscription.TARIFFS),
			onClick: () => setIsTariffsOpen(true),
		},
	];

	return (
		<>
			<Popover menuItems={authMenuLinks} className={styles['auth-popover']}>
				{({ onToggle }) => (
					<IconButton
						dataTestId="HeaderAuthMobile_IconButton"
						form="square"
						variant="tertiary"
						onClick={onToggle}
						className={styles['burger-button']}
						icon={<Icon icon="burger" size={32} />}
						aria-label={tHeader(Header.AUTH_MENU_ARIA)}
					/>
				)}
			</Popover>
			{isTariffsOpen && (
				<TariffsModal isOpen={isTariffsOpen} onClose={() => setIsTariffsOpen(false)} />
			)}
		</>
	);
};
