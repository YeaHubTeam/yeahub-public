'use server';

import 'server-only';

import {
	getSettingsSnapshot,
	linkOwnTelegram,
	sendOwnVerificationEmail,
	unlinkOwnTelegram,
} from '@/auth';
import type { TelegramMutationResult, VerificationEmailResult } from '@/entities/profile/server';

export async function requestVerificationEmail(): Promise<VerificationEmailResult> {
	try {
		return await sendOwnVerificationEmail();
	} catch {
		return { status: 'error' };
	}
}

export type EmailVerificationStatusResult =
	| { status: 'success'; isVerified: boolean }
	| { status: 'unauthenticated' | 'refresh-required' | 'forbidden' | 'error' };

export async function readEmailVerificationStatus(): Promise<EmailVerificationStatusResult> {
	try {
		const result = await getSettingsSnapshot();
		if (result.status === 'success')
			return { status: 'success', isVerified: result.snapshot.isVerified };
		if (result.status === 'identity-mismatch') return { status: 'error' };
		return { status: result.status };
	} catch {
		return { status: 'error' };
	}
}

export async function linkTelegram(payload: unknown): Promise<TelegramMutationResult> {
	try {
		return await linkOwnTelegram(payload);
	} catch {
		return { status: 'error' };
	}
}
export async function unlinkTelegram(): Promise<TelegramMutationResult> {
	try {
		return await unlinkOwnTelegram();
	} catch {
		return { status: 'error' };
	}
}
