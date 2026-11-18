'use client';

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { i18Namespace, useRouter } from '@/shared/config';
import { Stub } from '@/shared/ui/Stub';

export type PersonalListViewResult =
	| { status: 'success'; userId: string; profileId: string; hasPremiumAccess: boolean; isVerified: boolean; content: ReactNode }
	| { status: 'redirect'; userId: string; profileId: string; hasPremiumAccess: boolean; specializationSlug: string }
	| { status: 'premium-required'; userId: string; profileId: string; hasPremiumAccess: false }
	| { status: 'unauthenticated' | 'refresh-required' | 'no-active-profile' | 'identity-mismatch' | 'forbidden' | 'invalid-input' | 'error' };

export type QuestionsListScope =
	| { status: 'success'; userId: string; profileId: string | null; hasPremiumAccess: boolean; isVerified: boolean }
	| { status: 'unauthenticated' | 'refresh-required' | 'forbidden' | 'identity-mismatch' | 'error' };

const PersonalListContext = createContext<{
	result: PersonalListViewResult | null;
	guest: boolean;
	sessionLoading: boolean;
	loading: boolean;
	reload: () => void;
}>({ result: null, guest: true, sessionLoading: false, loading: false, reload: () => {} });

export const usePersonalQuestionsList = () => useContext(PersonalListContext);

export const QuestionListPersonalState = ({
	initialResult, readScope, serverUserId, serverSource, serverRevision, serverQuery, children,
}: {
	initialResult: PersonalListViewResult | null;
	readScope: () => Promise<QuestionsListScope>;
	serverUserId: string | null;
	serverSource: 'public' | 'personal';
	serverRevision: string;
	serverQuery: string;
	children: ReactNode;
}) => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const params = useSearchParams();
	const query = params?.toString() ?? '';
	const userId = status === 'authenticated' ? session?.user?.id : undefined;
	const needsRefresh = Boolean(session && 'requiresRefresh' in session && session.requiresRefresh);
	const [invalidRevision, setInvalidRevision] = useState<string | null>(null);
	const boundSession = useRef<typeof session | undefined>(undefined);
	const pending = useRef<Promise<void> | null>(null);
	const alive = useRef(false);
	useEffect(() => {
		alive.current = true;
		return () => { alive.current = false; };
	}, []);
	const refreshedRevision = useRef<string | null>(null);
	const current = useRef({ serverRevision, userId });
	useLayoutEffect(() => { current.current = { serverRevision, userId }; }, [serverRevision, userId]);
	const sameUser = serverSource === 'public'
		? !userId && status !== 'authenticated'
		: !serverUserId || status === 'loading' || userId === serverUserId;
	const reload = useCallback(() => {
		if (refreshedRevision.current === serverRevision) return;
		refreshedRevision.current = serverRevision;
		setInvalidRevision(serverRevision);
		router.refresh();
	}, [serverRevision, router]);

	const checkScope = useCallback(() => {
		if (pending.current) return pending.current;
		const revision = serverRevision;
		const ownerId = userId;
		const check = async () => {
			try {
				const next = await readScope();
				if (!alive.current || current.current.serverRevision !== revision || current.current.userId !== ownerId) return;
				const owner = initialResult && 'profileId' in initialResult ? initialResult : null;
				const unchanged = serverSource === 'public'
					? next.status === 'unauthenticated'
					: next.status === 'success'
						? next.userId === serverUserId && (owner
							? next.profileId === owner.profileId && next.hasPremiumAccess === owner.hasPremiumAccess &&
								(!('isVerified' in owner) || next.isVerified === owner.isVerified)
							: initialResult?.status === 'no-active-profile' && next.profileId === null)
						: next.status === initialResult?.status;
				if (!unchanged) reload();
			} catch {
				// A failed scope verification cannot confirm that the old private result is current.
				if (alive.current && current.current.serverRevision === revision) reload();
			}
		};
		const task = check().finally(() => { if (pending.current === task) pending.current = null; });
		pending.current = task;
		return task;
	}, [readScope, initialResult, serverSource, serverUserId, serverRevision, userId, reload]);

	useEffect(() => {
		if (status === 'loading') return;
		const previous = boundSession.current;
		boundSession.current = session;
		if (needsRefresh) return;
		if (!sameUser) reload();
		else if (previous !== undefined && previous !== session) void checkScope();
		// The first resolved session binds to SSR without repeating its list read.
	}, [session, status, sameUser, needsRefresh, checkScope, reload]);

	useEffect(() => {
		const check = () => { void checkScope(); };
		const visibility = () => { if (document.visibilityState === 'visible') check(); };
		const pageshow = (event: PageTransitionEvent) => { if (event.persisted) check(); };
		window.addEventListener('focus', check);
		window.addEventListener('pageshow', pageshow);
		document.addEventListener('visibilitychange', visibility);
		return () => {
			window.removeEventListener('focus', check);
			window.removeEventListener('pageshow', pageshow);
			document.removeEventListener('visibilitychange', visibility);
		};
	}, [checkScope]);

	const usable = sameUser && invalidRevision !== serverRevision && query === serverQuery;
	const result: PersonalListViewResult | null = needsRefresh
		? { status: 'refresh-required' }
		: usable ? initialResult : null;
	const guest = usable && serverSource === 'public' && !needsRefresh;
	return (
		<PersonalListContext.Provider value={{ result, guest, sessionLoading: status === 'loading', loading: !usable && !needsRefresh, reload }}>
			{children}
		</PersonalListContext.Provider>
	);
};

export const QuestionListContent = ({ children, fallback }: { children: ReactNode; fallback: ReactNode }) => {
	const { result, guest, loading, reload } = usePersonalQuestionsList();
	const params = useSearchParams();
	const t = useTranslations(i18Namespace.questions);
	const status = params?.get('status') ?? 'all';
	// Public children belong only to a server-confirmed guest response.
	if (guest && status === 'all') return children;
	if (loading || result?.status === 'redirect') return fallback;
	if (result?.status === 'success') return result.content;
	const reason = result?.status;
	if (guest || reason === 'unauthenticated' || reason === 'premium-required' || reason === 'no-active-profile') {
		return <Stub type="access-denied" subtitle={t(guest || reason === 'unauthenticated' ? 'personalList.signIn' : reason === 'premium-required' ? 'personalList.premium' : 'personalList.noProfile')} />;
	}
	return <Stub type="error" onClick={reload} />;
};
