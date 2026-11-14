import { useEffect, useState } from 'react';

import { format, isValid, parse } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTranslations } from 'next-intl';

import type { SubscriptionCancellationResult } from '@/entities/subscription/index.server';
import { i18Namespace } from '@/shared/config';
import { Modal } from '@/shared/ui/Modal';
import { Text } from '@/shared/ui/Text';

import type { CurrentSubscriptionView } from './CurrentSubscriptionInfo';
import type { TariffMutationGate } from './TrialActivation';
import styles from './UnsubscribeModal.module.css';

const endDateFromLabel = (label: string) => {
	const date = parse(label, 'd MMMM yyyy', new Date(0), { locale: ru });
	return isValid(date) && format(date, 'd MMMM yyyy', { locale: ru }) === label
		? date.getTime()
		: NaN;
};

export type CancellationAction = (
	expectedSubscriptionId: string,
) => Promise<SubscriptionCancellationResult>;
export const useSubscriptionCancellation = ({
	action,
	gate,
	expectedSubscriptionId,
	subscription,
}: {
	action?: CancellationAction;
	gate: TariffMutationGate;
	expectedSubscriptionId: string | null;
	subscription: CurrentSubscriptionView;
}) => {
	const identity = gate.identity;
	const [state, setState] = useState<{
		owner: string | null;
		open: boolean;
		target: string | null;
		attempted: boolean;
		confirmed: { id: string; view: NonNullable<CurrentSubscriptionView> } | null;
		toast: { variant: 'success' | 'error'; cancellation: true } | null;
	}>({
		owner: identity,
		open: false,
		target: null,
		attempted: false,
		confirmed: null,
		toast: null,
	});
	if (state.owner !== identity)
		setState({
			owner: identity,
			open: false,
			target: null,
			attempted: false,
			confirmed: null,
			toast: null,
		});
	const current = state.owner === identity;
	const hasNewActivePeriod =
		current &&
		state.confirmed?.id === expectedSubscriptionId &&
		subscription?.state === 'active' &&
		endDateFromLabel(subscription.endDateLabel) >
			endDateFromLabel(state.confirmed.view.endDateLabel);
	// Only a later end date proves renewal; stale props and the daily countdown do not.
	if (hasNewActivePeriod) setState((value) => ({ ...value, confirmed: null }));
	const view =
		current && state.confirmed?.id === expectedSubscriptionId && !hasNewActivePeriod
			? state.confirmed.view
			: subscription;
	useEffect(() => {
		if (!state.toast) return;
		const timer = setTimeout(() => setState((value) => ({ ...value, toast: null })), 3000);
		return () => clearTimeout(timer);
	}, [state.toast]);
	const canOpen =
		gate.ready &&
		!!action &&
		!!expectedSubscriptionId &&
		view?.state === 'active' &&
		gate.phase === 'idle';
	const submit = async () => {
		if (
			!action ||
			!gate.ready ||
			!current ||
			!state.open ||
			gate.ref.current.phase !== 'idle' ||
			view?.state !== 'active'
		)
			return;
		if (!state.target || state.target !== expectedSubscriptionId) {
			setState((value) => ({ ...value, toast: { variant: 'error', cancellation: true } }));
			return;
		}
		const target = state.target;
		const scope = gate.ref.current.scope;
		if (!scope) return;
		gate.update('cancel-pending');
		setState((value) => ({ ...value, attempted: true, toast: null }));
		let result: SubscriptionCancellationResult;
		try {
			result = await action(target);
			if (
				!result ||
				![
					'success',
					'invalid-input',
					'unauthenticated',
					'refresh-required',
					'verification-required',
					'not-available',
					'forbidden',
					'conflict',
					'incomplete',
					'outcome-unknown',
					'error',
				].includes(result.status)
			)
				throw new Error('Invalid cancellation result');
			if (
				result.status === 'success' &&
				(result.subscription?.state !== 'canceled' ||
					!Number.isFinite(result.subscription.daysLeft) ||
					result.subscription.daysLeft < 0 ||
					!Number.isInteger(result.subscription.daysInCreationMonth) ||
					result.subscription.daysInCreationMonth < 28 ||
					result.subscription.daysInCreationMonth > 31 ||
					typeof result.subscription.endDateLabel !== 'string' ||
					!result.subscription.endDateLabel)
			)
				throw new Error('Invalid cancellation projection');
		} catch {
			result = { status: 'outcome-unknown' };
		}
		if (gate.ref.current.scope !== scope || gate.ref.current.owner !== identity) return;
		if (result.status === 'success') {
			gate.update('cancel-succeeded');
			const confirmed = { id: target, view: result.subscription };
			setState((value) => ({
				...value,
				open: false,
				confirmed,
				toast: { variant: 'success', cancellation: true },
			}));
		} else {
			const terminal = ['incomplete', 'outcome-unknown', 'conflict'].includes(result.status);
			gate.update(terminal ? 'blocked' : 'idle');
			setState((value) => ({
				...value,
				attempted: terminal,
				toast: { variant: 'error', cancellation: true },
			}));
		}
	};
	return {
		subscription: view,
		// Pagination retention is scoped to this cancellation, never another tariff mutation.
		retainsHistory:
			current &&
			state.attempted &&
			['cancel-pending', 'cancel-succeeded', 'blocked'].includes(gate.phase),
		toast: current ? state.toast : null,
		isOpen: current && state.open,
		pending: gate.phase === 'cancel-pending',
		canOpen,
		disabled: !canOpen || state.target !== expectedSubscriptionId,
		open: () => {
			if (canOpen) setState((value) => ({ ...value, target: expectedSubscriptionId, open: true }));
		},
		close: () => setState((value) => ({ ...value, open: false })),
		submit: () => {
			void submit();
		},
	};
};
export type CancellationController = ReturnType<typeof useSubscriptionCancellation>;

export const UnsubscribeModal = ({ controller }: { controller: CancellationController }) => {
	const t = useTranslations(i18Namespace.subscription);
	if (!controller.isOpen) return null;
	return (
		<Modal
			title={t('unsubscribe.modal.title')}
			variant="error"
			isOpen={controller.isOpen}
			onClose={controller.close}
			className={styles.modal}
			buttonPrimaryText={t('unsubscribe.modal.button.yes')}
			buttonOutlineText={t('unsubscribe.modal.button.no')}
			buttonPrimaryClick={controller.submit}
			buttonPrimaryDisabled={controller.disabled}
			buttonOutlineClick={controller.close}
		>
			<div aria-busy={controller.pending}>
				<Text variant="body3" className={styles.description}>
					{t('unsubscribe.modal.description')}
				</Text>
			</div>
		</Modal>
	);
};
