'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import { SessionProvider, getSession, useSession } from 'next-auth/react';

const RETRY_PAUSE_MS = 30_000;

const RefreshSession = () => {
	const { data, status, update } = useSession();
	const inFlight = useRef(false);
	const attempted = useRef(false);
	const retryAfter = useRef(0);
	const mounted = useRef(false);
	const needsRefresh = Boolean(data && 'requiresRefresh' in data && data.requiresRefresh === true);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	const refresh = useCallback(
		async (userAction = false) => {
			if (status !== 'authenticated' || !needsRefresh || inFlight.current) return;
			if (attempted.current && (!userAction || Date.now() < retryAfter.current)) return;
			inFlight.current = true;
			attempted.current = true;
			retryAfter.current = Date.now() + RETRY_PAUSE_MS;
			try {
				// An empty object requests a CSRF-protected POST; update() alone only reads.
				const next = await update({});
				if (!mounted.current) return;
				if (next === null) {
					// getSession broadcasts from a separate channel; SessionProvider re-reads even null.
					await getSession();
				} else if (next && 'requiresRefresh' in next && next.requiresRefresh === false) {
					attempted.current = false;
				}
			} catch {
				// No automatic retries: focus/online may retry after the pause.
			} finally {
				inFlight.current = false;
				if (attempted.current) retryAfter.current = Date.now() + RETRY_PAUSE_MS;
			}
		},
		[needsRefresh, status, update],
	);

	useEffect(() => {
		if (status === 'authenticated' && !needsRefresh) attempted.current = false;
		void refresh();
	}, [needsRefresh, refresh, status]);

	useEffect(() => {
		const retry = () => {
			void refresh(true);
		};
		window.addEventListener('focus', retry);
		window.addEventListener('online', retry);
		return () => {
			window.removeEventListener('focus', retry);
			window.removeEventListener('online', retry);
		};
	}, [refresh]);

	return null;
};

export const AuthRefreshProvider = ({ children }: { children: ReactNode }) => (
	<SessionProvider refetchInterval={60} refetchWhenOffline={false}>
		<RefreshSession />
		{children}
	</SessionProvider>
);
