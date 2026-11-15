import 'server-only';

import { readPaymentHistory } from '@/entities/payment/index.server';
import type { PaymentHistoryResult } from '@/entities/payment/index.server';
import { getAuthBackendConfig } from '@/shared/config/index.server';

import { currentBackendSession } from '../../_auth/session.server';

// Read-only pagination: no profile request, auth update or client-supplied identity.
export const getSettingsPaymentHistory = async (
	page: unknown = 1,
): Promise<PaymentHistoryResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		return await readPaymentHistory(
			page,
			{ userId: session.data.userId, accessToken: session.data.accessToken },
			getAuthBackendConfig(),
		);
	} catch {
		return { status: 'error' };
	}
};
