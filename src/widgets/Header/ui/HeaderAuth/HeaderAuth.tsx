'use client';

import { Suspense, useEffect, useState } from 'react';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useTranslations } from 'next-intl';

import { authPageUrl, logoutSession, useSession } from '@/entities/session';
import { TariffsButton } from '@/entities/subscription';
import LogoutIcon from '@/shared/assets/icons/logout-icon.svg';
import { AvatarWithoutPhoto } from '@/shared/ui/AvatarWithoutPhoto';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Popover } from '@/shared/ui/Popover';
import { Text } from '@/shared/ui/Text';

import styles from './HeaderAuth.module.css';
import { HeaderAuthDesktop } from './HeaderAuthDesktop/HeaderAuthDesktop';
import { HeaderAuthMobile } from './HeaderAuthMobile/HeaderAuthMobile';

const HeaderAuthContent = () => {
	const { session, loading } = useSession();
	const pathname = usePathname();
	const query = useSearchParams().toString();
	const router = useRouter();
	const t = useTranslations('auth');
	const [returnPage, setReturnPage] = useState(pathname);
	const [message, setMessage] = useState('');
	const [failedImage, setFailedImage] = useState<string>();
	useEffect(() => {
		const update = () =>
			setReturnPage(`${window.location.pathname}${window.location.search}${window.location.hash}`);
		update();
		window.addEventListener('hashchange', update);
		return () => window.removeEventListener('hashchange', update);
	}, [pathname, query]);
	const loginUrl = authPageUrl('login', returnPage);
	const logout = async () => {
		setMessage('');
		try {
			const revoked = await logoutSession();
			if (!revoked) setMessage(t('localSignOut'));
			router.refresh();
		} catch {
			setMessage(t('unavailable'));
		}
	};
	const avatar =
		session?.user.avatarUrl && session.user.avatarUrl !== failedImage ? (
			<Image
				src={session.user.avatarUrl}
				alt=""
				width={58}
				height={58}
				unoptimized
				className={styles.image}
				onError={() => setFailedImage(session.user.avatarUrl ?? undefined)}
			/>
		) : (
			<AvatarWithoutPhoto />
		);
	return (
		<div className={styles.container}>
			{loading ? (
				<div className={styles.placeholder} aria-busy="true" aria-label={t('loading')} />
			) : session ? (
				<Popover
					key={pathname}
					header={
						<Flex direction="column" align="center" gap="14" className={styles.summary}>
							<div className={styles['summary-avatar']}>{avatar}</div>
							<div className={styles.identity}>
								<Text variant="body3-accent">{session.user.username}</Text>
								{session.user.email && (
									<Text variant="body2" color="black-700">
										{session.user.email}
									</Text>
								)}
							</div>
						</Flex>
					}
					menuItems={[
						{
							renderComponent: (close) => (
								<Button
									variant="tertiary"
									className={styles.logout}
									preffix={<LogoutIcon className={styles.icon} />}
									onClick={() => {
										close();
										void logout();
									}}
								>
									{t('logout')}
								</Button>
							),
						},
					]}
				>
					{({ onToggle, isOpen }) => (
						<button
							type="button"
							className={styles.preferences}
							onClick={onToggle}
							aria-label={t('profileMenu')}
							aria-expanded={isOpen}
							aria-haspopup="dialog"
						>
							<div className={styles.username}>
								<Text variant="body2" maxRows={1} className={styles['username-text']}>
									{session.user.username}
								</Text>
							</div>
							<div className={styles.avatar}>{avatar}</div>
						</button>
					)}
				</Popover>
			) : (
				<>
					<div className={styles['header-auth-desktop']}>
						<Flex align="center" gap="16">
							<TariffsButton />
							<HeaderAuthDesktop loginUrl={loginUrl} />
						</Flex>
					</div>
					<div className={styles['header-auth-mobile']}>
						<HeaderAuthMobile loginUrl={loginUrl} />
					</div>
				</>
			)}
			{message && (
				<div role="alert" className={styles.message}>
					<Text variant="body1">{message}</Text>
				</div>
			)}
		</div>
	);
};

// Query-aware client navigation stays inside Suspense; public routes remain statically renderable.
export const HeaderAuth = () => (
	<Suspense fallback={<div className={styles.placeholder} aria-busy="true" />}>
		<HeaderAuthContent />
	</Suspense>
);
