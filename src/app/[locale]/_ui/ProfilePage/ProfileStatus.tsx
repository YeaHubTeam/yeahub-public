'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import type { ReactNode } from 'react';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { ROUTES, i18Namespace, useRouter } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import styles from './ProfilePage.module.css';

type ProfileStatusKind = 'loading' | 'error' | 'no-active-profile' | 'refresh-required';

export const ProfileStatus = ({
	kind,
	onRetry,
}: {
	kind: ProfileStatusKind;
	onRetry?: () => void;
}) => {
	const t = useTranslations(i18Namespace.profile);
	const router = useRouter();
	const { data, status, update } = useSession();
	const requiresRefresh = data && 'requiresRefresh' in data ? data.requiresRefresh : undefined;
	const reloaded = useRef(false);
	const busy = useRef(false);
	const mounted = useRef(false);
	const [refreshing, setRefreshing] = useState(false);
	const [failed, setFailed] = useState(false);
	const [pending, startTransition] = useTransition();
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	useEffect(() => {
		if (kind !== 'refresh-required') {
			reloaded.current = false;
			return;
		}
		if (status === 'authenticated' && requiresRefresh === true) reloaded.current = false;
		if (status === 'unauthenticated' && !reloaded.current) {
			reloaded.current = true;
			router.replace(ROUTES.auth.login.page);
		} else if (status === 'authenticated' && requiresRefresh === false && !reloaded.current) {
			// SessionProvider has received the writable refresh result; re-render RSC once.
			reloaded.current = true;
			startTransition(() => router.refresh());
		}
	}, [requiresRefresh, kind, router, status]);
	const retry = async () => {
		if (busy.current) return;
		if (kind !== 'refresh-required') {
			startTransition(() => {
				onRetry?.();
				router.refresh();
			});
			return;
		}
		busy.current = true;
		setRefreshing(true);
		setFailed(false);
		try {
			// Explicit user retry is writable. Automatic rotation belongs to AuthRefreshProvider.
			const session = await update({});
			if (!mounted.current) return;
			if (!session) router.replace(ROUTES.auth.login.page);
			else if ('requiresRefresh' in session && session.requiresRefresh === false) {
				reloaded.current = true;
				startTransition(() => router.refresh());
			} else setFailed(true);
		} catch {
			if (mounted.current) setFailed(true);
		} finally {
			busy.current = false;
			if (mounted.current) setRefreshing(false);
		}
	};
	const key =
		kind === 'no-active-profile' ? 'empty' : kind === 'refresh-required' ? 'refresh' : kind;
	return (
		<Card withOutsideShadow>
			<div
				className={styles.state}
				role={kind === 'error' ? 'alert' : 'status'}
				aria-busy={kind === 'loading' || pending || refreshing}
			>
				<Text variant="body3">{t(`page.${key}`)}</Text>
				{failed && (
					<div role="alert">
						<Text variant="body2" color="red-700">
							{t('page.refreshError')}
						</Text>
					</div>
				)}
				{kind !== 'loading' && (
					<Button type="button" disabled={pending || refreshing} onClick={() => void retry()}>
						{t('page.retry')}
					</Button>
				)}
			</div>
		</Card>
	);
};

// Reveal private content only after the browser session confirms the same identity.
export const ProfileAccessBoundary = ({
	userId,
	children,
}: {
	userId: string;
	children: ReactNode;
}) => {
	const { data, status } = useSession();
	const router = useRouter();
	const handled = useRef<string | null>(null);
	const switched = status === 'authenticated' && data?.user?.id !== userId;
	useEffect(() => {
		if (status === 'unauthenticated' && handled.current !== 'logout') {
			handled.current = 'logout';
			router.replace(ROUTES.auth.login.page);
		} else if (switched) {
			const identity = data?.user?.id ?? 'missing';
			if (handled.current !== identity) {
				handled.current = identity;
				router.refresh();
			}
		}
	}, [data?.user?.id, router, status, switched]);
	return status !== 'authenticated' || switched ? <ProfileStatus kind="loading" /> : children;
};
