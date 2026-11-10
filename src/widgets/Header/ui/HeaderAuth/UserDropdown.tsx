import { useRef, useState } from 'react';

import Image from 'next/image';

import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import LogoutIcon from '@/shared/assets/icons/logout-icon.svg';
import { Header, ROUTES, Translation, i18Namespace } from '@/shared/config';
import { useRouter } from '@/shared/config/navigation';
import { useScreenSize } from '@/shared/libs';
import { AvatarWithoutPhoto } from '@/shared/ui/AvatarWithoutPhoto';
import { Button } from '@/shared/ui/Button';
import { Popover } from '@/shared/ui/Popover';
import { Text } from '@/shared/ui/Text';

import authStyles from './HeaderAuth.module.css';
import styles from './UserDropdown.module.css';

interface UserDropdownProps {
	username: string;
	image?: string | null;
	email?: string | null;
}

export const UserDropdown = ({ username, image, email }: UserDropdownProps) => {
	const t = useTranslations(i18Namespace.header);
	const tCommon = useTranslations(i18Namespace.translation);
	const { isMobile, isTablet } = useScreenSize();
	const visibleEmail = email?.trim();
	const router = useRouter();
	const pending = useRef(false);
	const [isSigningOut, setIsSigningOut] = useState(false);
	const onLogout = async () => {
		if (pending.current) return;
		pending.current = true;
		setIsSigningOut(true);
		try {
			const result = await signOut({ redirect: false });
			if (!result?.url) return;
			router.replace(ROUTES.auth.login.page);
		} catch {
			// No confirmed Auth.js response: stay on the page and allow another attempt.
		} finally {
			pending.current = false;
			setIsSigningOut(false);
		}
	};

	// Unmount the portal when moving to the existing mobile avatar-only layout.
	if (isMobile || isTablet) return null;

	const avatar = (size: number) =>
		image ? (
			<Image
				src={image}
				alt={tCommon(Translation.AVATAR)}
				width={size}
				height={size}
				unoptimized
				className={authStyles.image}
			/>
		) : (
			<AvatarWithoutPhoto />
		);
	const menuItems = [
		Header.USER_PROFILE,
		Header.USER_MEMBERSHIP,
		Header.USER_SETTINGS,
		Header.USER_LOGOUT,
	].map((key) => ({
		renderComponent: () => (
			<Button
				type="button"
				variant="tertiary-link"
				disabled={key !== Header.USER_LOGOUT || isSigningOut}
				aria-busy={key === Header.USER_LOGOUT ? isSigningOut : undefined}
				onClick={key === Header.USER_LOGOUT ? () => void onLogout() : undefined}
				className={
					key === Header.USER_LOGOUT
						? `${styles['menu-item']} ${styles.logout}`
						: styles['menu-item']
				}
				preffix={
					key === Header.USER_LOGOUT ? (
						<LogoutIcon className={styles['logout-icon']} aria-hidden="true" focusable="false" />
					) : undefined
				}
			>
				{t(key)}
			</Button>
		),
	}));

	return (
		<Popover
			ariaLabel={t(Header.AUTH_MENU_ARIA)}
			className={styles.panel}
			menuItems={menuItems}
			header={
				<div className={styles.header}>
					<div className={`${authStyles.avatar} ${styles['large-avatar']}`}>{avatar(58)}</div>
					{(username || visibleEmail) && (
						<div className={styles['header-text']}>
							{username && (
								<Text variant="body3-accent" className={styles.name}>
									{username}
								</Text>
							)}
							{visibleEmail && (
								<Text variant="body2" color="black-700">
									{visibleEmail}
								</Text>
							)}
						</div>
					)}
				</div>
			}
		>
			{({ onToggle, isOpen }) => (
				<button
					type="button"
					className={`${authStyles.user} ${styles.trigger}`}
					onClick={onToggle}
					aria-label={t(Header.AUTH_MENU_ARIA)}
					aria-expanded={isOpen}
				>
					{username && (
						<Text variant="body2" className={authStyles.nickname}>
							{username}
						</Text>
					)}
					<div className={authStyles.avatar}>{avatar(40)}</div>
				</button>
			)}
		</Popover>
	);
};
