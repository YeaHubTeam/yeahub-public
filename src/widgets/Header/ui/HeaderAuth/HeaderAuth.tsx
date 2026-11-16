'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { useAvatarState } from '@/entities/profile';
import type { HeaderProfile, HeaderProfileResult } from '@/entities/profile';
import { Translation, i18Namespace } from '@/shared/config';
import { AvatarWithoutPhoto } from '@/shared/ui/AvatarWithoutPhoto';
import { Text } from '@/shared/ui/Text';

import styles from './HeaderAuth.module.css';
import { HeaderAuthMobile } from './HeaderAuthMobile/HeaderAuthMobile';
import { UserDropdown } from './UserDropdown';

type HeaderRead = () => Promise<HeaderProfileResult>;
const HeaderUser = ({
	userId,
	ready,
	loadHeaderProfileAction,
}: {
	userId: string;
	ready: boolean;
	loadHeaderProfileAction: HeaderRead;
}) => {
	const { value } = useAvatarState();
	const [profile, setProfile] = useState<HeaderProfile | null>(null);
	const request = useRef<Promise<HeaderProfileResult> | null>(null);
	const [failed, setFailed] = useState<{ userId: string; url: string } | null>(null);
	useEffect(() => {
		if (!ready) return;
		let active = true;
		// Reuse this mount's promise during StrictMode effect replay and ordinary rerenders.
		request.current ??= Promise.resolve().then(() => loadHeaderProfileAction());
		void request.current
			.then((result) => {
				if (active && result.status === 'success' && result.profile.userId === userId)
					setProfile(result.profile);
			})
			.catch(() => {
				/* Keep fallback. No auth updates or automatic retries. */
			});
		return () => {
			active = false;
		};
	}, [ready, loadHeaderProfileAction, userId]);
	const image = value?.userId === userId ? value.avatarUrl : profile?.avatarUrl;
	const username = profile?.username.trim() ?? '';
	const user = { id: userId, email: profile?.email };

	const t = useTranslations(i18Namespace.translation);

	return (
		<>
			<div className={styles['header-auth-desktop']}>
				<UserDropdown key={user.id} username={username} image={image} email={user.email} />
			</div>
			<div className={styles['header-auth-mobile']}>
				<div className={styles.user}>
					{username && (
						<Text variant="body2" className={styles.nickname}>
							{username}
						</Text>
					)}
					<div className={styles.avatar}>
						{image && !(failed?.userId === user.id && failed?.url === image) ? (
							<Image
								src={image}
								onError={() => setFailed({ userId: user.id, url: image })}
								alt={t(Translation.AVATAR)}
								width={40}
								height={40}
								unoptimized
								className={styles.image}
							/>
						) : (
							<AvatarWithoutPhoto />
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export const HeaderAuth = ({
	desktopGuest,
	loadHeaderProfileAction,
}: {
	desktopGuest: ReactNode;
	loadHeaderProfileAction: HeaderRead;
}) => {
	const { data: session, status } = useSession();
	if (status === 'authenticated' && session?.user?.id)
		return (
			<HeaderUser
				key={session.user.id}
				userId={session.user.id}
				ready={!('requiresRefresh' in session) || session.requiresRefresh !== true}
				loadHeaderProfileAction={loadHeaderProfileAction}
			/>
		);
	const loading = status === 'loading';
	return (
		<div
			className={loading ? styles.loading : undefined}
			aria-busy={loading || undefined}
			aria-hidden={loading || undefined}
			inert={loading || undefined}
		>
			<div className={styles['header-auth-desktop']}>{desktopGuest}</div>
			<div className={styles['header-auth-mobile']}>
				<HeaderAuthMobile />
			</div>
		</div>
	);
};
