import type { TariffGate } from '@/shared/config/index.server';

export type SettingsSnapshot = {
	userId: string;
	username: string | null;
	hasPremiumAccess: boolean;
	canStartTrial: boolean;
	email: string | null;
	isVerified: boolean;
	telegramUsername: string | null;
	profiles: { id: string; specializationId: number; isActive: boolean }[];
	activeProfileId: string | null;
	subscriptions: {
		id: string;
		subscriptionId: number;
		state: 'pending_payment' | 'active' | 'canceled' | 'inactive';
		createDate: string;
		endDate: string | null;
	}[];
};
export type SettingsSnapshotResult =
	| { status: 'success'; snapshot: SettingsSnapshot; tariffGate?: TariffGate }
	| {
			status: 'unauthenticated' | 'refresh-required' | 'forbidden' | 'identity-mismatch' | 'error';
	  };
