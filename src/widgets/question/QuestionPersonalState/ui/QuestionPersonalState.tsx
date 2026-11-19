'use client';

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { ProgressBlock, ProgressBlockSkeleton } from '@/entities/question';
import type {
	PersonalNavigationPageReader,
	FavoriteQuestionInput,
	FavoriteQuestionResult,
	QuestionPersonalStateResult,
	QuestionStudyInput,
	QuestionStudyResult,
	QuestionStudyOperation,
} from '@/entities/question';
import { FavoriteQuestionButton } from '@/features/question/favoriteQuestion';
import { i18Namespace } from '@/shared/config';
import { useScreenSize } from '@/shared/libs';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { QuestionActions } from './QuestionActions';
import styles from './QuestionPersonalState.module.css';

type Success = Extract<QuestionPersonalStateResult, { status: 'success' }>;
const FavoriteUpdateContext = createContext<(before: Success, after: Success) => void>(() => {});

type State = { scope: string; session: unknown; result: QuestionPersonalStateResult | null };

const PersonalStateContext = createContext<QuestionPersonalStateResult | null | 'guest'>('guest');

export const QuestionPersonalStateProvider = ({
	questionId,
	children,
}: {
	questionId: number;
	children: ReactNode;
}) => {
	const { data: session, status } = useSession();
	const userId = status === 'authenticated' ? session?.user?.id : undefined;
	const needsRefresh = Boolean(
		session && 'requiresRefresh' in session && session.requiresRefresh === true,
	);
	const ready = !!userId && !needsRefresh;
	if (!userId)
		return <PersonalStateContext.Provider value="guest">{children}</PersonalStateContext.Provider>;
	return (
		<PersonalStateContent
			key={`${userId}:${questionId}:${ready}`}
			questionId={questionId}
			userId={userId}
			ready={ready}
			session={session}
		>
			{children}
		</PersonalStateContent>
	);
};

// Identity/question transitions unmount the old state owner instead of retaining its data.
const PersonalStateContent = ({
	questionId,
	userId,
	ready,
	session,
	children,
}: {
	questionId: number;
	userId: string;
	ready: boolean;
	session: unknown;
	children: ReactNode;
}) => {
	const scope = `${userId}:${questionId}:${ready}`;
	const [state, setState] = useState<State | null>(null);

	useEffect(() => {
		if (!ready) return;
		let alive = true;
		let generation = 0;
		let controller: AbortController | undefined;
		const clear = () => {
			generation++;
			controller?.abort();
			setState({ scope, session, result: null });
		};
		const load = async () => {
			clear();
			const ticket = generation;
			controller = new AbortController();
			try {
				const response = await fetch(`/api/questions/${questionId}/personal-state`, {
					cache: 'no-store',
					credentials: 'same-origin',
					redirect: 'error',
					signal: controller.signal,
				});
				const result: QuestionPersonalStateResult = await response.json();
				if (!alive || ticket !== generation) return;
				if (
					result.status === 'success' &&
					(result.userId !== userId || result.state.questionId !== questionId)
				) {
					setState({ scope, session, result: { status: 'identity-mismatch' } });
					return;
				}
				setState({ scope, session, result });
			} catch {
				if (alive && ticket === generation)
					setState({ scope, session, result: { status: 'error' } });
			}
		};
		const refresh = () => {
			void load();
		};
		const visibility = () => {
			if (document.visibilityState === 'hidden') clear();
			else refresh();
		};
		refresh();
		window.addEventListener('focus', refresh);
		window.addEventListener('pageshow', refresh);
		document.addEventListener('visibilitychange', visibility);
		return () => {
			alive = false;
			generation++;
			controller?.abort();
			window.removeEventListener('focus', refresh);
			window.removeEventListener('pageshow', refresh);
			document.removeEventListener('visibilitychange', visibility);
		};
	}, [questionId, ready, scope, userId, session]);

	// A replaced session cannot reuse a resolved response, even before its effect cleans up.
	const result = ready && state?.scope === scope && state.session === session ? state.result : null;
	return (
		<FavoriteUpdateContext.Provider
			value={(before, after) => {
				setState((current) =>
					current?.result === before && current.session === session
						? { ...current, result: after }
						: current,
				);
			}}
		>
			<PersonalStateContext.Provider value={result}>{children}</PersonalStateContext.Provider>
		</FavoriteUpdateContext.Provider>
	);
};

export const QuestionProgress = ({ inDrawer = false }: { inDrawer?: boolean }) => {
	const result = useContext(PersonalStateContext);
	const t = useTranslations(i18Namespace.questions);
	const className = inDrawer ? styles.drawer : undefined;
	if (result === 'guest' || result?.status === 'unauthenticated')
		return <ProgressBlock checksCount={0} className={className} />;
	return (
		<div role="status" aria-live="polite" aria-busy={!result}>
			{!result ? (
				<ProgressBlockSkeleton className={className} />
			) : result.status === 'success' ? (
				<ProgressBlock checksCount={result.state.checksCount} className={className} />
			) : (
				<Card withOutsideShadow className={className}>
					<Flex direction="column" gap="16">
						<Text variant="body5-accent" color="black-800">
							{t('progress.title')}
						</Text>
						<Text variant="body1-accent" color="black-400">
							{t(result.status === 'no-active-profile' ? 'progress.noProfile' : 'progress.error')}
						</Text>
					</Flex>
				</Card>
			)}
		</div>
	);
};

export const QuestionFavoriteActions = ({
	action,
	navigation,
	progressAction,
}: {
	action: (input: FavoriteQuestionInput) => Promise<FavoriteQuestionResult>;
	navigation?: { readPersonalPage?: PersonalNavigationPageReader; questionId: number; specialization?: { id: number; slug: string } };
	progressAction?: (input: QuestionStudyInput) => Promise<QuestionStudyResult>;
}) => {
	const result = useContext(PersonalStateContext);
	const update = useContext(FavoriteUpdateContext);
	const { isMobile } = useScreenSize();
	const t = useTranslations(i18Namespace.questions);
	const current = useRef(result);
	useLayoutEffect(() => {
		current.current = result;
	}, [result]);
	const alive = useRef(true);
	useEffect(() => {
		alive.current = true;
		return () => {
			alive.current = false;
		};
	}, []);
	const lock = useRef<Success | null>(null);
	const [pending, setPending] = useState<Success | null>(null);
	const [error, setError] = useState<Success | null>(null);
	const [progressError, setProgressError] = useState<{ owner: Success; operation: QuestionStudyOperation } | null>(null);
	const success = result && result !== 'guest' && result.status === 'success' ? result : null;
	const isGuest = result === 'guest' || result?.status === 'unauthenticated';
	const toggle = async () => {
		if (!success || !success.isVerified || lock.current === success) return;
		lock.current = success;
		setPending(success);
		setError(null);
		setProgressError(null);
		try {
			const after = await action({
				questionId: success.state.questionId,
				expectedProfileId: success.profileId,
				favorite: !success.state.isFavorite,
			});
			if (!alive.current || current.current !== success) return;
			if (
				after.status === 'success' &&
				after.userId === success.userId &&
				after.profileId === success.profileId &&
				after.state.questionId === success.state.questionId &&
				after.state.isFavorite !== success.state.isFavorite
			)
				update(success, after);
			else setError(success);
		} catch {
			if (alive.current && current.current === success) setError(success);
		} finally {
			if (lock.current === success) lock.current = null;
			if (alive.current) setPending((p) => (p === success ? null : p));
		}
	};
	const changeProgress = async (operation: QuestionStudyOperation) => {
		if (!progressAction || !success || !success.isVerified || !success.hasPremiumAccess || lock.current === success) return;
		if (operation === 'learn' ? success.state.checksCount >= 3 : success.state.checksCount === 0) return;
		lock.current = success;
		setPending(success);
		setError(null);
		setProgressError(null);
		try {
			const after = await progressAction({ questionId: success.state.questionId, expectedProfileId: success.profileId, operation });
			if (!alive.current || current.current !== success) return;
			if (after.status === 'success' && after.userId === success.userId && after.profileId === success.profileId &&
				after.state.questionId === success.state.questionId && (operation === 'learn'
					? after.state.checksCount === 3 && after.state.isLearned
					: after.state.checksCount === 0 && !after.state.isLearned)) update(success, after);
			else setProgressError({ owner: success, operation });
		} catch {
			if (alive.current && current.current === success) setProgressError({ owner: success, operation });
		} finally {
			if (lock.current === success) lock.current = null;
			if (alive.current) setPending(p => p === success ? null : p);
		}
	};
	return (
		<QuestionActions
			isGuest={isGuest}
			questionId={navigation?.questionId}
			specialization={navigation?.specialization}
			readPersonalPage={navigation?.readPersonalPage}
			personalNavigationState={success ?? undefined}
			checksCount={success?.state.checksCount ?? 0}
			isEmailVerified={success?.isVerified === true}
			hasPremium={success?.hasPremiumAccess}
			isLoading={pending === success}
			onLearn={progressAction ? () => { void changeProgress('learn'); } : undefined}
			onReset={progressAction ? () => { void changeProgress('reset'); } : undefined}
			variant={isMobile ? 'link-gray' : 'tertiary'}
			favoriteButton={
				<FavoriteQuestionButton
					isGuest={isGuest}
					isFavorite={success?.state.isFavorite}
					disabled={!success?.isVerified || pending === success}
					variant={isMobile ? 'link-gray' : 'tertiary'}
					onClick={() => {
						void toggle();
					}}
				/>
			}
			error={success && (progressError?.owner === success ? (
				<Text variant="body3-accent" color="red-800">{t(progressError.operation === 'learn' ? 'studyError.learn' : 'studyError.reset')}</Text>
			) : error === success && (
				<Text variant="body3-accent" color="red-800">
					{t(success.state.isFavorite ? 'favoriteError.delete' : 'favoriteError.add')}
				</Text>
			))}
		/>
	);
};
