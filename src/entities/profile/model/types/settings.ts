export type SettingsSnapshot = {
	userId: string;
	email: string | null;
	isVerified: boolean;
	telegramUsername: string | null;
	profiles: { id: string; specializationId: number; isActive: boolean }[];
	activeProfileId: string | null;
	subscriptions: {
		id: string;
		subscriptionId: number;
		state: 'pending_payment' | 'active' | 'canceled' | 'inactive';
	}[];
};
export type SettingsSnapshotResult =
	| { status: 'success'; snapshot: SettingsSnapshot }
	| {
			status: 'unauthenticated' | 'refresh-required' | 'forbidden' | 'identity-mismatch' | 'error';
	  };
