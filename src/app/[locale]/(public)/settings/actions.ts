'use server';

import { revalidatePath } from 'next/cache';

import { getLocale } from 'next-intl/server';
import 'server-only';

import { changeOwnPassword } from '@/app/_auth/index.server';
import { getSettingsPaymentHistory } from '@/app/_bff/payment/index.server';
import {
	createOwnSettingsProfile,
	deleteOwnSettingsAccount,
	deleteOwnSettingsProfile,
	linkOwnTelegram,
	selectOwnSettingsProfile,
	sendOwnVerificationEmail,
	unlinkOwnTelegram,
} from '@/app/_bff/profile/index.server';
import { getSettingsSnapshot } from '@/app/_bff/settings/index.server';
import {
	cancelOwnSettingsSubscription,
	initializeOwnSettingsPayment,
	startOwnSettingsTrial,
} from '@/app/_bff/subscription/index.server';
import type { ChangePasswordResult } from '@/entities/auth';
import type { PaymentHistoryResult } from '@/entities/payment/index.server';
import type {
	AccountDeletionResult,
	ProfileDeletionResult,
	SettingsProfileCreationResult,
	SettingsProfileSelectionResult,
	TelegramMutationResult,
	VerificationEmailResult,
} from '@/entities/profile/index.server';
import { getSpecializationById } from '@/entities/specialization';
import type {
	PaymentInitInput,
	PaymentInitResult,
	SubscriptionCancellationResult,
	TrialResult,
} from '@/entities/subscription/index.server';
import { ROUTES, routing } from '@/shared/config';
import { route } from '@/shared/libs';

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

export async function changePassword(input: unknown): Promise<ChangePasswordResult> {
	try {
		return await changeOwnPassword(input);
	} catch {
		return { status: 'error' };
	}
}

export async function selectSettingsProfile(
	profileId: string,
): Promise<SettingsProfileSelectionResult> {
	try {
		const result = await selectOwnSettingsProfile(profileId);
		if (result.status !== 'success') return result;
		if (result.changed) {
			const locale = await getLocale();
			if (!routing.locales.some((value) => value === locale)) return { status: 'error' };
			for (const path of [ROUTES.profile.page, `${ROUTES.profile.page}/edit`, ROUTES.settings.page])
				revalidatePath(`/${locale}${path}`);
		}
		if (result.specializationId === 0)
			return { status: 'success', href: `${ROUTES.profile.page}/edit` };
		if (!Number.isSafeInteger(result.specializationId) || result.specializationId < 0)
			return { status: 'navigation-unavailable' };
		try {
			const specialization = await getSpecializationById(result.specializationId);
			const slug = specialization?.slug;
			// A single encoded path segment: no separators, dot traversal, query/hash or percent escapes.
			if (
				specialization?.id !== result.specializationId ||
				typeof slug !== 'string' ||
				!slug ||
				/[^A-Za-z0-9_-]/.test(slug)
			)
				return { status: 'navigation-unavailable' };
			return { status: 'success', href: route(ROUTES.questions.page, slug) };
		} catch {
			return { status: 'navigation-unavailable' };
		}
	} catch {
		return { status: 'error' };
	}
}

export async function createSettingsProfile(): Promise<SettingsProfileCreationResult> {
	let confirmed = false;
	try {
		const locale = await getLocale();
		if (!routing.locales.some((value) => value === locale)) return { status: 'error' };
		const result = await createOwnSettingsProfile();
		if (result.status !== 'success') return result;
		confirmed = true;
		for (const path of [ROUTES.profile.page, `${ROUTES.profile.page}/edit`, ROUTES.settings.page])
			revalidatePath(`/${locale}${path}`);
		return { status: 'success', href: '/profile/edit' };
	} catch {
		return { status: confirmed ? 'incomplete' : 'error' };
	}
}

export async function deleteSettingsProfile(
	profileId: string,
	confirmationUsername: string,
): Promise<ProfileDeletionResult> {
	let confirmed = false;
	try {
		const locale = await getLocale();
		if (!routing.locales.some((value) => value === locale)) return { status: 'error' };
		const result = await deleteOwnSettingsProfile(profileId, confirmationUsername);
		if (result.status !== 'success') return result;
		confirmed = true;
		for (const path of [ROUTES.profile.page, `${ROUTES.profile.page}/edit`, ROUTES.settings.page])
			revalidatePath(`/${locale}${path}`);
		return { status: 'success' };
	} catch {
		return { status: confirmed ? 'incomplete' : 'error' };
	}
}

export async function deleteSettingsAccount(
	confirmationUsername: unknown,
): Promise<AccountDeletionResult> {
	try {
		return await deleteOwnSettingsAccount(confirmationUsername);
	} catch {
		return { status: 'error' };
	}
}

export async function readSettingsPaymentHistory(page: unknown): Promise<PaymentHistoryResult> {
	try {
		return await getSettingsPaymentHistory(page);
	} catch {
		return { status: 'error' };
	}
}

export async function startSettingsTrial(): Promise<TrialResult> {
	let confirmed = false;
	let started = false;
	try {
		const locale = await getLocale();
		if (!routing.locales.some((value) => value === locale)) return { status: 'error' };
		started = true;
		const result = await startOwnSettingsTrial();
		if (result.status !== 'success') return result;
		confirmed = true;
		for (const path of [ROUTES.settings.page, ROUTES.profile.page, `${ROUTES.profile.page}/edit`])
			revalidatePath(`/${locale}${path}`);
		return { status: 'success' };
	} catch {
		return { status: confirmed ? 'incomplete' : started ? 'outcome-unknown' : 'error' };
	}
}

export async function initializeSettingsPayment(
	input: PaymentInitInput,
): Promise<PaymentInitResult> {
	try {
		return await initializeOwnSettingsPayment(input);
	} catch {
		return { status: 'outcome-unknown' };
	}
}

export async function cancelSettingsSubscription(
	expectedSubscriptionId: string,
): Promise<SubscriptionCancellationResult> {
	let started = false;
	let confirmed = false;
	try {
		const locale = await getLocale();
		if (!routing.locales.some((value) => value === locale)) return { status: 'error' };
		started = true;
		const result = await cancelOwnSettingsSubscription(expectedSubscriptionId);
		if (result.status !== 'success') return result;
		confirmed = true;
		for (const path of [ROUTES.settings.page, ROUTES.profile.page, `${ROUTES.profile.page}/edit`])
			revalidatePath(`/${locale}${path}`);
		return result;
	} catch {
		return { status: confirmed ? 'incomplete' : started ? 'outcome-unknown' : 'error' };
	}
}
