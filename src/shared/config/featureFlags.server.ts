import 'server-only';

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
	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	const unavailable = { status: 'unavailable' } as const;
	try {
		if (!config.allowedOrigins.includes(config.apiOrigin)) return unavailable;
		const url = new URL('/feature-flags', config.apiOrigin);
		url.search = new URLSearchParams({
			clientType: 'WEB',
			search: key,
			page: '1',
			limit: '10',
		}).toString();
		const request = async (): Promise<TariffFlagResult> => {
			const response = await fetch(url, {
				cache: 'no-store',
				redirect: 'manual',
				credentials: 'omit',
				signal: controller.signal,
			});
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
		};
		return await Promise.race([
			request(),
			new Promise<TariffFlagResult>((resolve) => {
				timer = setTimeout(() => {
					controller.abort();
					resolve(unavailable);
				}, 5000);
			}),
		]);
	} catch {
		return unavailable;
	} finally {
		clearTimeout(timer);
	}
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
