import 'server-only';

import { readSettingsSnapshot } from '@/entities/profile/index.server';
import { requestTrial } from '@/entities/subscription/index.server';
import type { TrialResult } from '@/entities/subscription/index.server';
import { getAuthBackendConfig } from '@/shared/config/index.server';

import { deadline } from '../../_auth/backendSession.server';
import { currentBackendSession } from '../../_auth/session.server';

// Explicit trial mutation with fresh eligibility and one post-success readback.
export const startOwnSettingsTrial = async (): Promise<TrialResult> => {
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
		if (!before.snapshot.canStartTrial) return { status: 'not-eligible' };
		const now = Math.floor(Date.now() / 1000);
		if (deadline(session.data) <= now) return { status: 'unauthenticated' };
		if (session.data.accessExpiresAt <= now) return { status: 'refresh-required' };
		sent = true;
		const result = await requestTrial(credentials, config);
		if (result.status !== 'success') return result;
		confirmed = true;
		const after = await readSettingsSnapshot(credentials, config);
		if (after.status !== 'success' || after.snapshot.userId !== session.data.userId)
			return { status: 'incomplete' };
		const trials = after.snapshot.subscriptions.filter((item) => item.subscriptionId === 4);
		const trial = trials[0];
		if (
			trials.length !== 1 ||
			!trial ||
			trial.state !== 'active' ||
			!trial.endDate ||
			Date.parse(trial.endDate) <= Date.now()
		)
			return { status: 'incomplete' };
		return { status: 'success' };
	} catch {
		return { status: confirmed ? 'incomplete' : sent ? 'outcome-unknown' : 'error' };
	}
};
