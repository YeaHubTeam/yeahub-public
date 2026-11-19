'use client';

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import type { QuestionListActions } from '@/entities/question';

import { FavoriteQuestionButton } from '@/features/question/favoriteQuestion';
import { LearnQuestionButton } from '@/features/quiz/learnQuestion';
import { ResetQuestionStudyProgressButton } from '@/features/quiz/resetQuestionStudyProgress';
import { i18Namespace } from '@/shared/config';
import { Icon } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui/IconButton';
import { Popover } from '@/shared/ui/Popover';
import type { PopoverMenuItem } from '@/shared/ui/Popover';

export type QuestionActionsMenuState = {
	userId: string;
	profileId: string;
	checksCount?: number;
	isLearned?: boolean;
	isFavorite?: boolean;
	isEmailVerified?: boolean;
	hasPremium?: boolean;
	isLoading?: boolean;
};

export const QuestionActionsMenu = ({ detailHref, state, questionId, actions }: {
	detailHref: string;
	questionId: number;
	actions?: QuestionListActions;
	state: QuestionActionsMenuState;
}) => {
	const t = useTranslations(i18Namespace.questions);
	const router = useRouter();
	const { data: session, status: sessionStatus } = useSession();
	const userId = session?.user?.id;
	const needsRefresh = Boolean(session && 'requiresRefresh' in session && session.requiresRefresh);
	const current = useRef({ state, userId });
	useLayoutEffect(() => { current.current = { state, userId }; }, [state, userId]);
	const alive = useRef(false);
	useEffect(() => {
		alive.current = true;
		return () => { alive.current = false; };
	}, []);
	// The owner lives outside Popover's mounted contents: closing/reopening cannot replay a POST.
	const lock = useRef<QuestionActionsMenuState | null>(null);
	const [pending, setPending] = useState<QuestionActionsMenuState | null>(null);
	const [error, setError] = useState<{ owner: QuestionActionsMenuState; key: string } | null>(null);
	const [refreshPending, startRefresh] = useTransition();
	const active = sessionStatus === 'authenticated' && userId === state.userId && !needsRefresh;
	const isPending = pending === state || refreshPending;
	const errorMessage = error?.owner === state ? t(error.key) : undefined;

	const mutate = async (operation: 'favorite' | 'learn' | 'reset') => {
		if (!actions || !active || !state.isEmailVerified || lock.current === state || refreshPending) return;
		if (operation === 'favorite') {
			if (typeof state.isFavorite !== 'boolean') return;
		} else {
			if (!state.hasPremium || !Number.isSafeInteger(state.checksCount) || typeof state.isLearned !== 'boolean') return;
			if (operation === 'learn' ? state.checksCount! >= 3 : state.checksCount === 0) return;
		}
		const owner = state;
		const isCurrent = () => alive.current && current.current.state === owner && current.current.userId === owner.userId;
		lock.current = owner;
		setPending(owner);
		setError(null);
		let confirmed = false;
		try {
			const result = operation === 'favorite'
				? await actions.favorite({ questionId, expectedProfileId: owner.profileId, favorite: !owner.isFavorite })
				: await actions.study({ questionId, expectedProfileId: owner.profileId, operation });
			if (!isCurrent()) return;
			confirmed = result.status === 'success' && result.userId === owner.userId &&
				result.profileId === owner.profileId && result.state.questionId === questionId &&
				(operation === 'favorite' ? result.state.isFavorite === !owner.isFavorite
					: operation === 'learn' ? result.state.checksCount === 3 && result.state.isLearned
						: result.state.checksCount === 0 && !result.state.isLearned);
			if (confirmed) {
				// No local row deletion or optimistic badge. RSC re-reads the same query, count and page.
				// Keep the lock until the new server owner arrives (or this row unmounts).
				startRefresh(() => router.refresh());
			} else {
				setError({ owner, key: operation === 'favorite'
					? owner.isFavorite ? 'favoriteError.delete' : 'favoriteError.add'
					: operation === 'learn' ? 'studyError.learn' : 'studyError.reset' });
				if (result.status === 'identity-mismatch' || result.status === 'unauthenticated' || result.status === 'refresh-required')
					startRefresh(() => router.refresh());
			}
		} catch {
			if (isCurrent()) setError({ owner, key: operation === 'favorite'
				? owner.isFavorite ? 'favoriteError.delete' : 'favoriteError.add'
				: operation === 'learn' ? 'studyError.learn' : 'studyError.reset' });
		} finally {
			if (!confirmed && lock.current === owner) {
				lock.current = null;
				if (alive.current) setPending(value => value === owner ? null : value);
			}
		}
	};
	const menuItems: PopoverMenuItem[] = [
		{
			icon: <Icon icon="more" color="black-600" size={20} />,
			title: t('questions.link'),
			onClick: () => router.push(detailHref),
		},
		{ renderComponent: () => <LearnQuestionButton
			checksCount={state.checksCount} isEmailVerified={state.isEmailVerified}
			hasPremium={state.hasPremium} isLoading={state.isLoading || isPending || !active}
			onLearn={actions ? () => { void mutate('learn'); } : undefined}
			isPopover placementTooltip="left" offsetTooltip={20} /> },
		{ renderComponent: () => <ResetQuestionStudyProgressButton
			checksCount={state.checksCount} isEmailVerified={state.isEmailVerified}
			hasPremium={state.hasPremium} isLoading={state.isLoading || isPending || !active}
			onReset={actions ? () => { void mutate('reset'); } : undefined}
			isPopover placementTooltip="left" offsetTooltip={20} /> },
		{ renderComponent: () => <FavoriteQuestionButton
			isFavorite={state.isFavorite}
			disabled={!active || !state.isEmailVerified || typeof state.isFavorite !== 'boolean' || isPending}
			onClick={actions ? () => { void mutate('favorite'); } : undefined}
			isPopover placementTooltip="left" offsetTooltip={20} /> },
	];
	return (
		<Popover menuItems={menuItems}>
			{({ onToggle }) => <IconButton title={errorMessage} aria-label={errorMessage ? `${t('actions.menu')}: ${errorMessage}` : t('actions.menu')}
				form="square" icon={<Icon icon="dotsThreeVertical" size={20} color="black-600" />}
				size="small" variant="tertiary" onClick={onToggle} />}
		</Popover>
	);
};
