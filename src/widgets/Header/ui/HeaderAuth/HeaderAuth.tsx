'use client';

import type { ReactNode } from 'react';

import Image from 'next/image';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { Translation, i18Namespace } from '@/shared/config';
import { AvatarWithoutPhoto } from '@/shared/ui/AvatarWithoutPhoto';
import { Text } from '@/shared/ui/Text';

import styles from './HeaderAuth.module.css';
import { HeaderAuthMobile } from './HeaderAuthMobile/HeaderAuthMobile';
import { UserDropdown } from './UserDropdown';

export const HeaderAuth = ({ desktopGuest }: { desktopGuest: ReactNode }) => {
	const { data: session, status } = useSession();
	const t = useTranslations(i18Namespace.translation);

	if (status === 'authenticated' && session?.user) {
		const user = session.user;
		const username =
			'username' in user && typeof user.username === 'string' ? user.username.trim() : '';
		return (
			<>
				<div className={styles['header-auth-desktop']}>
					<UserDropdown key={user.id} username={username} image={user.image} email={user.email} />
				</div>
				<div className={styles['header-auth-mobile']}>
					<div className={styles.user}>
						{username && (
							<Text variant="body2" className={styles.nickname}>
								{username}
							</Text>
						)}
						<div className={styles.avatar}>
							{user.image ? (
								<Image
									src={user.image}
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
	}

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
