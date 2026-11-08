'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { TariffsModal } from '@/entities/subscription';
import { Header, Subscription, i18Namespace } from '@/shared/config';
import { Icon } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui/IconButton';
import { Popover, PopoverMenuItem } from '@/shared/ui/Popover';
import { UserPlusIcon } from '@/widgets/Header/ui/HeaderAuth/UserPlusIcon';

import styles from './HeaderAuthMobile.module.css';

export const HeaderAuthMobile = ({ loginUrl = '/ru/auth/login' }: { loginUrl?: string } = {}) => {
	const [isTariffsOpen, setIsTariffsOpen] = useState(false);
	const tHeader = useTranslations(i18Namespace.header);
	const tSubscription = useTranslations(i18Namespace.subscription);

	const authMenuLinks: PopoverMenuItem[] = [
		{
			icon: <UserPlusIcon isCurrentColor />,
			title: tHeader(Header.AUTH_SIGN_IN),
			link: loginUrl,
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
