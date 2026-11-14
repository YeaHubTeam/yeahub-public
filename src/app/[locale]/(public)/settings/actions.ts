'use server';

import { revalidatePath } from 'next/cache';

import { getLocale } from 'next-intl/server';
import 'server-only';

import {
	changeOwnPassword,
	createOwnSettingsProfile,
	deleteOwnSettingsAccount,
	deleteOwnSettingsProfile,
	getSettingsSnapshot,
	linkOwnTelegram,
	selectOwnSettingsProfile,
	sendOwnVerificationEmail,
	unlinkOwnTelegram,
} from '@/auth';
import type { ChangePasswordResult } from '@/auth';
import type {
	AccountDeletionResult,
	ProfileDeletionResult,
	SettingsProfileCreationResult,
	SettingsProfileSelectionResult,
	TelegramMutationResult,
	VerificationEmailResult,
} from '@/entities/profile/server';
import { getSpecializationById } from '@/entities/specialization';
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
