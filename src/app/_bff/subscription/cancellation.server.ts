import { differenceInDays, format, getDaysInMonth, isValid, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'server-only';

import { readSettingsSnapshot } from '@/entities/profile/index.server';
import {
	isCancellationSubscriptionId,
	requestSubscriptionCancellation,
} from '@/entities/subscription/index.server';
import type { SubscriptionCancellationResult } from '@/entities/subscription/index.server';
import { getAuthBackendConfig } from '@/shared/config/index.server';

import { deadline } from '../../_auth/backendSession.server';
import { currentBackendSession } from '../../_auth/session.server';

// No replay: state readback cannot prove primary/rebill cleanup after a failed DELETE.
export const cancelOwnSettingsSubscription = async (
	expectedSubscriptionId: string,
): Promise<SubscriptionCancellationResult> => {
	if (!isCancellationSubscriptionId(expectedSubscriptionId)) return { status: 'invalid-input' };
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	let sent = false;
	let confirmed = false;
	try {
		const config = getAuthBackendConfig();
		const credentials = { userId: session.data.userId, accessToken: session.data.accessToken };
		const before = await readSettingsSnapshot(credentials, config);
		if (before.status !== 'success')
			return { status: before.status === 'identity-mismatch' ? 'error' : before.status };
		if (before.snapshot.userId !== session.data.userId) return { status: 'error' };
		if (!before.snapshot.isVerified) return { status: 'verification-required' };
		const now = Date.now();
		const selected = before.snapshot.subscriptions.find(
			(item) =>
				(item.state === 'active' || item.state === 'canceled') &&
				item.endDate !== null &&
				Number.isFinite(Date.parse(item.endDate)) &&
				Date.parse(item.endDate) >= now,
		);
		if (!selected || selected.state !== 'active') return { status: 'not-available' };
		if (selected.id !== expectedSubscriptionId) return { status: 'conflict' };
		const seconds = Math.floor(Date.now() / 1000);
		if (deadline(session.data) <= seconds) return { status: 'unauthenticated' };
		if (session.data.accessExpiresAt <= seconds) return { status: 'refresh-required' };
		sent = true;
		const result = await requestSubscriptionCancellation(
			selected.subscriptionId,
			credentials,
			config,
		);
		if (result.status !== 'success') return result;
		confirmed = true;
		const after = await readSettingsSnapshot(credentials, config);
		if (after.status !== 'success' || after.snapshot.userId !== session.data.userId)
			return { status: 'incomplete' };
		const canceled = after.snapshot.subscriptions.find((item) => item.id === selected.id);
		if (
			!canceled ||
			canceled.subscriptionId !== selected.subscriptionId ||
			canceled.state !== 'canceled' ||
			canceled.endDate !== selected.endDate ||
			!canceled.endDate
		)
			return { status: 'incomplete' };
		const createDate = parseISO(canceled.createDate);
		const endDate = parseISO(canceled.endDate);
		if (!isValid(createDate) || !isValid(endDate)) return { status: 'incomplete' };
		return {
			status: 'success',
			subscription: {
				state: 'canceled',
				daysLeft: Math.max(0, differenceInDays(endDate, new Date())),
				daysInCreationMonth: getDaysInMonth(createDate),
				endDateLabel: format(endDate, 'd MMMM yyyy', { locale: ru }),
			},
		};
	} catch {
		return { status: confirmed ? 'incomplete' : sent ? 'outcome-unknown' : 'error' };
	}
};
