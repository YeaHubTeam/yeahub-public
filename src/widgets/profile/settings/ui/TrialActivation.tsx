import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import type { TrialResult } from '@/entities/subscription/index.server';
import { ROUTES, Translation, i18Namespace, useRouter } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './TrialActivation.module.css';

export type TariffPhase =
	| 'idle'
	| 'trial-pending'
	| 'trial-succeeded'
	| 'payment-pending'
	| 'payment-link-ready'
	| 'cancel-pending'
	| 'cancel-succeeded'
	| 'blocked';
export const useTariffMutationGate = () => {
	const { data, status } = useSession();
	const [state, setState] = useState<{ owner: string | null; phase: TariffPhase }>({
		owner: status === 'authenticated' ? (data?.user?.id ?? null) : null,
		phase: 'idle',
	});
	const identity =
		status === 'loading'
			? state.owner
			: status === 'authenticated'
				? (data?.user?.id ?? null)
				: null;
	if (state.owner !== identity) setState({ owner: identity, phase: 'idle' });
	const ref = useRef<{
		owner: string | null;
		phase: TariffPhase;
		refreshed: boolean;
		scope: object | null;
	}>({ owner: state.owner, phase: 'idle', refreshed: false, scope: {} });
	useLayoutEffect(() => {
		if (ref.current.owner !== identity)
			ref.current = { owner: identity, phase: 'idle', refreshed: false, scope: {} };
		if (!ref.current.scope) ref.current.scope = {};
		return () => {
			ref.current.scope = null;
		};
	}, [identity]);
	const update = useCallback((phase: TariffPhase) => {
		ref.current.phase = phase;
		setState({ owner: ref.current.owner, phase });
	}, []);
	const markRefreshed = useCallback(() => {
		ref.current.refreshed = true;
	}, []);
	return {
		ref,
		update,
		markRefreshed,
		phase: state.owner === identity ? state.phase : ('idle' as TariffPhase),
		identity,
		ready: status === 'authenticated' && identity !== null,
	};
};
export type TariffMutationGate = ReturnType<typeof useTariffMutationGate>;

type Phase = 'idle' | 'pending' | 'succeeded' | 'blocked';
type Toast = { variant: 'success' | 'error'; payment?: boolean; cancellation?: boolean } | null;
export type TrialAction = () => Promise<TrialResult>;

export const useTrialActivation = ({
	action,
	eligible,
	isVerified,
	sharedGate,
}: {
	action?: TrialAction;
	eligible: boolean;
	isVerified: boolean;
	sharedGate: TariffMutationGate;
}) => {
	const { data, status } = useSession();
	const router = useRouter();
	const [state, setState] = useState<{ owner: string | null; phase: Phase; toast: Toast }>(() => ({
		owner: status === 'authenticated' ? (data?.user?.id ?? null) : null,
		phase: 'idle',
		toast: null,
	}));
	// Temporary loading is not an identity change and must not reset a terminal gate.
	const identity =
		status === 'loading'
			? state.owner
			: status === 'authenticated'
				? (data?.user?.id ?? null)
				: null;
	if (state.owner !== identity) setState({ owner: identity, phase: 'idle', toast: null });
	const gate = sharedGate.ref;
	const markRefreshed = sharedGate.markRefreshed;
	const scope = useRef<object | null>(null);
	useEffect(() => {
		scope.current = {};

		return () => {
			scope.current = null;
		};
	}, [identity]);
	const ready = status === 'authenticated' && identity !== null;
	useEffect(() => {
		if (
			ready &&
			state.owner === identity &&
			state.phase === 'succeeded' &&
			gate.current.owner === identity &&
			!gate.current.refreshed
		) {
			markRefreshed();
			try {
				router.refresh();
			} catch {
				/* Confirmed mutation remains terminal; never replay it. */
			}
		}
	}, [ready, identity, state.owner, state.phase, router, gate, markRefreshed]);
	useEffect(() => {
		const toast = state.toast;
		if (!toast) return;
		const timer = setTimeout(
			() =>
				setState((current) => (current.toast === toast ? { ...current, toast: null } : current)),
			3000,
		);
		return () => clearTimeout(timer);
	}, [state.toast]);
	const activate = async () => {
		if (!ready || !eligible || !action) return;

		if (gate.current.phase !== 'idle') return;
		if (!isVerified) {
			router.push(`${ROUTES.settings.page}#email-verify`);
			return;
		}
		sharedGate.update('trial-pending');
		setState((current) => ({ ...current, phase: 'pending', toast: null }));
		const token = scope.current;
		let result: TrialResult;
		try {
			result = await action();
		} catch {
			result = { status: 'outcome-unknown' };
		}
		if (scope.current !== token || gate.current.owner !== identity) return;
		const phase: Phase =
			result.status === 'success'
				? 'succeeded'
				: result.status === 'incomplete' || result.status === 'outcome-unknown'
					? 'blocked'
					: 'idle';
		sharedGate.update(
			phase === 'succeeded' ? 'trial-succeeded' : phase === 'blocked' ? 'blocked' : 'idle',
		);
		setState((current) =>
			current.owner === identity
				? {
						...current,
						phase,
						toast: { variant: result.status === 'success' ? 'success' : 'error' },
					}
				: current,
		);
		if (result.status === 'verification-required')
			router.push(`${ROUTES.settings.page}#email-verify`);
	};
	return {
		disabled: !ready || !eligible || !action || sharedGate.phase !== 'idle',
		pending: state.phase === 'pending',
		toast: state.owner === identity ? state.toast : null,
		activate: () => {
			void activate();
		},
	};
};
export type TrialController = ReturnType<typeof useTrialActivation>;

const ToastMessage = ({ toast }: { toast: NonNullable<Toast> }) => {
	const t = useTranslations(i18Namespace.translation);
	const success = toast.variant === 'success';
	return (
		<div
			role={success ? 'status' : 'alert'}
			className={`${styles.toast} ${success ? styles.success : styles.error}`}
		>
			<Flex align="center" gap="16">
				<Icon
					icon={success ? 'checkCircle' : 'closeCircle'}
					color={success ? 'green-900' : 'red-700'}
				/>
				<Flex direction="column">
					<Text variant="body3-strong" color={success ? 'green-900' : 'red-700'}>
						{t(success ? Translation.TOAST_TITLE_SUCCESS : Translation.TOAST_TITLE_ERROR)}
					</Text>
					<Text variant="body3">
						{t(
							toast.cancellation
								? success
									? Translation.TOAST_SUBSCRIPTIONS_UNSUBSCRIBE_SUCCESS
									: Translation.TOAST_SUBSCRIPTIONS_UNSUBSCRIBE_FAILED
								: toast.payment
									? Translation.TOAST_SUBSCRIPTIONS_SUBSCRIBE_FAILED
									: success
										? Translation.TOAST_SUBSCRIPTIONS_TRIAL_SUCCESS
										: Translation.TOAST_SUBSCRIPTIONS_TRIAL_FAILED,
						)}
					</Text>
				</Flex>
			</Flex>
		</div>
	);
};

export const TrialToast = ({ toast }: { toast: Toast }) =>
	toast ? <ToastMessage toast={toast} /> : null;
