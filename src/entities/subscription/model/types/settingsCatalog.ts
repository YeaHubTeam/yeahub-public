import type { TariffGate } from '@/shared/config/index.server';

export type SettingsTariff = {
	id: number;
	code: 'free' | 'month' | 'quarter' | 'year';
	finalPrice: number;
	pricePerMonth: number;
	discount: number;
	monthPeriod: number;
};
export type SettingsTariffCatalogResult =
	| {
			status: 'success';
			gate: Extract<TariffGate, { status: 'allowed' }>;
			tariffs: SettingsTariff[];
	  }
	| { status: 'hidden'; gate: Exclude<TariffGate, { status: 'allowed' }> }
	| { status: 'error'; reason: 'backend' | 'timeout' | 'invalid-response' };
