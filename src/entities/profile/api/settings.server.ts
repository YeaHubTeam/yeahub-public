import 'server-only';

import { backendHttp } from '@/shared/api/index.server';
import { evaluateTariffGate } from '@/shared/config/index.server';
import type { TariffFlagResult } from '@/shared/config/index.server';

import type { SettingsSnapshot, SettingsSnapshotResult } from '../model/types/settings';
import type { ProfileBackendConfig } from './profile.server';

const object = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
// Backend Date fields arrive as ISO timestamps, not epoch values or locale dates.
const date = (value: unknown): string | null => {
	if (
		typeof value !== 'string' ||
		!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
	)
		return null;
	const parsed = new Date(value);
	const calendar = new Date(`${value.slice(0, 19)}Z`);
	if (
		!Number.isFinite(parsed.getTime()) ||
		!Number.isFinite(calendar.getTime()) ||
		calendar.toISOString().slice(0, 19) !== value.slice(0, 19)
	)
		return null;
	return parsed.toISOString();
};
// Narrow read-only projection: no active profile or unrelated AuthUser fields required.
export const readSettingsSnapshot = async (
	credentials: { userId: string; accessToken: string },
	config: ProfileBackendConfig,
	tariffFlag?: TariffFlagResult,
): Promise<SettingsSnapshotResult> => {
	try {
		if (!credentials.userId || !/^[A-Za-z0-9._~-]+$/.test(credentials.accessToken))
			return { status: 'error' };
		const result = await backendHttp<SettingsSnapshotResult>({
			config,
			path: '/auth/profile',
			method: 'GET',
			effect: 'read',
			cache: 'no-store',
			timeoutMs: 5000,
			headers: { Authorization: `Bearer ${credentials.accessToken}` },
			decode: async (response) => {
				if (response.status === 401) return { status: 'unauthenticated' };
				if (response.status === 403) return { status: 'forbidden' };
				if (response.status !== 200) return { status: 'error' };
				const data: unknown = await response.json();
				if (!object(data) || typeof data.id !== 'string' || !data.id) return { status: 'error' };
				if (data.id !== credentials.userId) return { status: 'identity-mismatch' };
				if (
					(data.email !== null && typeof data.email !== 'string') ||
					typeof data.isVerified !== 'boolean' ||
					(data.telegramUsername !== undefined &&
						data.telegramUsername !== null &&
						typeof data.telegramUsername !== 'string') ||
					!Array.isArray(data.profiles) ||
					!Array.isArray(data.subscriptions)
				)
					return { status: 'error' };

				// Roles are used only to compute the display capability; never expose their full objects.
				const roles = data.userRoles ?? [];
				if (!Array.isArray(roles)) return { status: 'error' };
				let hasCandidatePremiumRole = false;
				for (const role of roles) {
					if (!object(role) || !Number.isInteger(role.id) || !text(role.name))
						return { status: 'error' };
					if (role.name === 'candidate-premium') hasCandidatePremiumRole = true;
				}
				const profiles: SettingsSnapshot['profiles'] = [];
				for (const item of data.profiles) {
					if (
						!object(item) ||
						!text(item.id) ||
						!Number.isInteger(item.specializationId) ||
						(item.isActive !== undefined && typeof item.isActive !== 'boolean') ||
						(item.userId !== undefined && item.userId !== credentials.userId) ||
						profiles.some((p) => p.id === item.id)
					)
						return { status: 'error' };
					profiles.push({
						id: item.id,
						specializationId: item.specializationId as number,
						isActive: item.isActive === true,
					});
				}
				const active = profiles.filter((p) => p.isActive);
				if (active.length > 1) return { status: 'error' };
				const subscriptions: SettingsSnapshot['subscriptions'] = [];
				for (const item of data.subscriptions) {
					if (
						!object(item) ||
						!text(item.id) ||
						!Number.isSafeInteger(item.subscriptionId) ||
						(item.subscriptionId as number) <= 0 ||
						item.userId !== credentials.userId ||
						typeof item.state !== 'string' ||
						!['pending_payment', 'active', 'canceled', 'inactive'].includes(item.state) ||
						subscriptions.some((s) => s.id === item.id)
					)
						return { status: 'error' };
					const createDate = date(item.createDate);
					const endDate = item.endDate == null ? null : date(item.endDate);
					if (!createDate || (item.endDate != null && !endDate)) return { status: 'error' };
					subscriptions.push({
						id: item.id,
						subscriptionId: item.subscriptionId as number,
						state: item.state as SettingsSnapshot['subscriptions'][number]['state'],
						createDate,
						endDate,
					});
				}
				// Match React getTrialSubscription(): the first trial record determines its state.
				const hasActiveTrialSubscription =
					subscriptions.find((subscription) => subscription.subscriptionId === 4)?.state ===
					'active';
				return {
					status: 'success',
					...(tariffFlag
						? {
								tariffGate: evaluateTariffGate(
									tariffFlag,
									Array.isArray(data.userRoles)
										? roles.map((role) => (role as Record<string, unknown>).name as string)
										: null,
								),
							}
						: {}),
					snapshot: {
						userId: data.id,
						username: typeof data.username === 'string' ? data.username : null,
						hasPremiumAccess: hasCandidatePremiumRole || hasActiveTrialSubscription,
						canStartTrial:
							Array.isArray(data.userRoles) &&
							!hasCandidatePremiumRole &&
							!subscriptions.some((subscription) => subscription.subscriptionId === 4),
						email: data.email,
						isVerified: data.isVerified,
						telegramUsername: data.telegramUsername || null,
						profiles,
						activeProfileId: active[0]?.id ?? null,
						subscriptions,
					},
				};
			},
		});
		return result.status === 'response' ? result.value : { status: 'error' };
	} catch {
		return { status: 'error' };
	}
};
