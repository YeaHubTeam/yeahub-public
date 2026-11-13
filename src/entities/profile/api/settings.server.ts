import 'server-only';

import type { SettingsSnapshot, SettingsSnapshotResult } from '../model/types/settings';
import type { ProfileBackendConfig } from './profile.server';

const object = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
// Narrow read-only projection: no active profile or unrelated AuthUser fields required.
export const readSettingsSnapshot = async (
	credentials: { userId: string; accessToken: string },
	config: ProfileBackendConfig,
): Promise<SettingsSnapshotResult> => {
	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		if (
			!config.allowedOrigins.includes(config.apiOrigin) ||
			!credentials.userId ||
			!/^[A-Za-z0-9._~-]+$/.test(credentials.accessToken)
		)
			return { status: 'error' };
		const request = async (): Promise<SettingsSnapshotResult> => {
			const response = await fetch(new URL('/auth/profile', config.apiOrigin), {
				cache: 'no-store',
				redirect: 'manual',
				credentials: 'omit',
				signal: controller.signal,
				headers: { Authorization: `Bearer ${credentials.accessToken}` },
			});
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
					!Number.isInteger(item.subscriptionId) ||
					item.userId !== credentials.userId ||
					typeof item.state !== 'string' ||
					!['pending_payment', 'active', 'canceled', 'inactive'].includes(item.state) ||
					subscriptions.some((s) => s.id === item.id)
				)
					return { status: 'error' };
				subscriptions.push({
					id: item.id,
					subscriptionId: item.subscriptionId as number,
					state: item.state as SettingsSnapshot['subscriptions'][number]['state'],
				});
			}
			return {
				status: 'success',
				snapshot: {
					userId: data.id,
					email: data.email,
					isVerified: data.isVerified,
					telegramUsername: data.telegramUsername || null,
					profiles,
					activeProfileId: active[0]?.id ?? null,
					subscriptions,
				},
			};
		};
		const timeout = new Promise<SettingsSnapshotResult>((resolve) => {
			timer = setTimeout(() => {
				controller.abort();
				resolve({ status: 'error' });
			}, 5000);
		});
		return await Promise.race([request(), timeout]);
	} catch {
		return { status: 'error' };
	} finally {
		clearTimeout(timer);
	}
};
