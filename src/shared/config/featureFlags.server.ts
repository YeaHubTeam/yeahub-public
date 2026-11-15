import 'server-only';

import { backendHttp } from '@/shared/api/index.server';

export type PublicBackendConfig = { apiOrigin: string; allowedOrigins: readonly string[] };
export type TariffGate =
	| { status: 'allowed'; showTariffs: true }
	| { status: 'disabled' | 'missing' | 'role-denied' | 'unavailable'; showTariffs: false };
export type TariffFlagResult =
	| { status: 'success'; enabled: boolean; roles: string[] }
	| { status: 'missing' | 'unavailable' };

const key = 'dashboard.subscription.show-tariffs';
const object = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

export const readTariffFlag = async (config: PublicBackendConfig): Promise<TariffFlagResult> => {
	const unavailable = { status: 'unavailable' } as const;
	const query = new URLSearchParams({
		clientType: 'WEB',
		search: key,
		page: '1',
		limit: '10',
	});
	const result = await backendHttp<TariffFlagResult>({
		config,
		path: `/feature-flags?${query.toString()}`,
		method: 'GET',
		effect: 'read',
		cache: 'no-store',
		timeoutMs: 5000,
		decode: async (response) => {
			if (response.status !== 200) return unavailable;
			const data: unknown = await response.json();
			if (
				!object(data) ||
				!Array.isArray(data.data) ||
				data.page !== 1 ||
				data.limit !== 10 ||
				!Number.isSafeInteger(data.total) ||
				(data.total as number) < 0 ||
				data.total !== data.data.length ||
				data.data.length > 10
			)
				return unavailable;
			const matches: { enabled: boolean; roles: string[] }[] = [];
			for (const flag of data.data) {
				if (
					!object(flag) ||
					!text(flag.flag) ||
					!['WEB', 'IOS', 'ANDROID'].includes(flag.clientType as string) ||
					typeof flag.enabled !== 'boolean' ||
					!Array.isArray(flag.roles) ||
					!flag.roles.every(text)
				)
					return unavailable;
				if (flag.flag === key && flag.clientType === 'WEB')
					matches.push({ enabled: flag.enabled, roles: flag.roles });
			}
			if (matches.length > 1) return unavailable;
			return matches.length ? { status: 'success', ...matches[0] } : { status: 'missing' };
		},
	});
	return result.status === 'response' ? result.value : unavailable;
};

// Only validated role names from the trusted backend profile may be supplied here.
export const evaluateTariffGate = (
	flag: TariffFlagResult,
	roleNames: readonly string[] | null,
): TariffGate => {
	if (flag.status !== 'success') return { status: flag.status, showTariffs: false };
	if (!flag.enabled) return { status: 'disabled', showTariffs: false };
	if (!flag.roles.length) return { status: 'allowed', showTariffs: true };
	if (roleNames === null) return { status: 'unavailable', showTariffs: false };
	return roleNames.some((role) => flag.roles.includes(role))
		? { status: 'allowed', showTariffs: true }
		: { status: 'role-denied', showTariffs: false };
};
