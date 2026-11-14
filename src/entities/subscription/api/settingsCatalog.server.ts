import 'server-only';

import type { PublicBackendConfig, TariffGate } from '@/shared/config/index.server';

import type { SettingsTariff, SettingsTariffCatalogResult } from '../model/types/settingsCatalog';

const codes: SettingsTariff['code'][] = ['free', 'month', 'quarter', 'year'];
const object = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
const integer = (value: unknown, minimum: number): value is number =>
	typeof value === 'number' && Number.isSafeInteger(value) && value >= minimum;
export const readSettingsCatalog = async (
	gate: TariffGate,
	config: PublicBackendConfig,
): Promise<SettingsTariffCatalogResult> => {
	if (gate.status !== 'allowed') return { status: 'hidden', gate };
	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		if (!config.allowedOrigins.includes(config.apiOrigin))
			return { status: 'error', reason: 'backend' };
		const request = async (): Promise<SettingsTariffCatalogResult> => {
			const response = await fetch(new URL('/subscriptions', config.apiOrigin), {
				cache: 'no-store',
				redirect: 'manual',
				credentials: 'omit',
				signal: controller.signal,
			});
			if (response.status !== 200) return { status: 'error', reason: 'backend' };
			const invalid = { status: 'error', reason: 'invalid-response' } as const;
			let data: unknown;
			try {
				data = await response.json();
			} catch {
				return invalid;
			}
			if (!Array.isArray(data)) return invalid;
			const ids = new Set<number>();
			const visibleCodes = new Set<string>();
			const tariffs: SettingsTariff[] = [];
			for (const item of data) {
				if (
					!object(item) ||
					!integer(item.id, 1) ||
					ids.has(item.id) ||
					typeof item.code !== 'string' ||
					!item.code ||
					typeof item.isActive !== 'boolean'
				)
					return invalid;
				ids.add(item.id);
				if (!item.isActive || !codes.includes(item.code as SettingsTariff['code'])) continue;
				if (
					visibleCodes.has(item.code) ||
					!integer(item.finalPrice, 0) ||
					!integer(item.pricePerMonth, 0) ||
					!integer(item.discount, 0) ||
					item.discount > 100 ||
					!integer(item.monthPeriod, 1)
				)
					return invalid;
				visibleCodes.add(item.code);
				tariffs.push({
					id: item.id,
					code: item.code as SettingsTariff['code'],
					finalPrice: item.finalPrice,
					pricePerMonth: item.pricePerMonth,
					discount: item.discount,
					monthPeriod: item.monthPeriod,
				});
			}
			tariffs.sort((a, b) => codes.indexOf(a.code) - codes.indexOf(b.code));
			return { status: 'success', gate, tariffs };
		};
		return await Promise.race([
			request(),
			new Promise<SettingsTariffCatalogResult>((resolve) => {
				timer = setTimeout(() => {
					controller.abort();
					resolve({ status: 'error', reason: 'timeout' });
				}, 5000);
			}),
		]);
	} catch {
		return { status: 'error', reason: 'backend' };
	} finally {
		clearTimeout(timer);
	}
};
