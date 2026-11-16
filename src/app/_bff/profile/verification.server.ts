import 'server-only';

import {
	mutateTelegram,
	parseTelegramPayload,
	sendVerificationEmail,
} from '@/entities/profile/index.server';
import type {
	TelegramMutationResult,
	VerificationEmailResult,
} from '@/entities/profile/index.server';
import { getAuthBackendConfig } from '@/shared/config/index.server';

import { currentBackendSession } from '../../_auth/session.server';

// Explicit invocation only: never called by a render or snapshot read.
export const sendOwnVerificationEmail = async (): Promise<VerificationEmailResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		return await sendVerificationEmail(
			{ userId: session.data.userId, accessToken: session.data.accessToken },
			getAuthBackendConfig(),
		);
	} catch {
		return { status: 'error' };
	}
};

export const linkOwnTelegram = async (payload: unknown): Promise<TelegramMutationResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	const data = parseTelegramPayload(payload);
	if (!data) return { status: 'validation-error' };
	try {
		return await mutateTelegram(
			{ type: 'link', payload: data },
			{ userId: session.data.userId, accessToken: session.data.accessToken },
			getAuthBackendConfig(),
		);
	} catch {
		return { status: 'error' };
	}
};

export const unlinkOwnTelegram = async (): Promise<TelegramMutationResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		return await mutateTelegram(
			{ type: 'unlink' },
			{ userId: session.data.userId, accessToken: session.data.accessToken },
			getAuthBackendConfig(),
		);
	} catch {
		return { status: 'error' };
	}
};
