import 'server-only';

import { readSettingsSnapshot } from '@/entities/profile/index.server';
import {
	parsePaymentInitInput,
	readSettingsCatalog,
	requestPaymentInit,
} from '@/entities/subscription/index.server';
import type { PaymentInitInput, PaymentInitResult } from '@/entities/subscription/index.server';
import { getAuthBackendConfig, readTariffFlag } from '@/shared/config/index.server';

import { deadline } from '../../_auth/backendSession.server';
import { currentBackendSession } from '../../_auth/session.server';

// Explicit payment initialization only. No session writes or mutation replay.
export const initializeOwnSettingsPayment = async (
	input: PaymentInitInput,
): Promise<PaymentInitResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	const parsed = parsePaymentInitInput(input);
	if (!parsed) return { status: 'invalid-input' };
	let sent = false;
	try {
		const config = getAuthBackendConfig();
		const credentials = { userId: session.data.userId, accessToken: session.data.accessToken };
		const flag = await readTariffFlag(config);
		const before = await readSettingsSnapshot(credentials, config, flag);
		if (before.status !== 'success')
			return { status: before.status === 'identity-mismatch' ? 'error' : before.status };
		if (before.snapshot.userId !== session.data.userId) return { status: 'error' };
		if (!before.snapshot.isVerified) return { status: 'verification-required' };
		const catalog = await readSettingsCatalog(
			before.tariffGate ?? { status: 'unavailable', showTariffs: false },
			config,
		);
		if (catalog.status === 'hidden') return { status: 'not-available' };
		if (catalog.status !== 'success') return { status: 'error' };
		if (
			!catalog.tariffs.some(
				(tariff) =>
					tariff.id === parsed.tariffId && ['month', 'quarter', 'year'].includes(tariff.code),
			)
		)
			return { status: 'not-available' };
		const payment = parsePaymentInitInput({
			...parsed,
			email: before.snapshot.email ?? parsed.email,
		});
		if (!payment) return { status: 'invalid-input' };
		const now = Math.floor(Date.now() / 1000);
		if (deadline(session.data) <= now) return { status: 'unauthenticated' };
		if (session.data.accessExpiresAt <= now) return { status: 'refresh-required' };
		sent = true;
		return await requestPaymentInit(payment, credentials, config);
	} catch {
		return { status: sent ? 'outcome-unknown' : 'error' };
	}
};
