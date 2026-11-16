import 'server-only';

import { readSettingsSnapshot } from '@/entities/profile/index.server';
import type { SettingsSnapshotResult } from '@/entities/profile/index.server';
import { readSettingsCatalog } from '@/entities/subscription/index.server';
import type { SettingsTariffCatalogResult } from '@/entities/subscription/index.server';
import { getAuthBackendConfig, readTariffFlag } from '@/shared/config/index.server';

import { currentBackendSession } from '../../_auth/session.server';

// Read-only settings composition; credentials remain private to this server module.
export const getSettingsSnapshot = async (): Promise<SettingsSnapshotResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		return await readSettingsSnapshot(
			{ userId: session.data.userId, accessToken: session.data.accessToken },
			getAuthBackendConfig(),
		);
	} catch {
		return { status: 'error' };
	}
};

// Explicit page-only composition. Ordinary snapshot reads and mutations never load flags/catalog.
export const getSettingsPageData = async (): Promise<
	| {
			status: 'success';
			snapshot: Extract<SettingsSnapshotResult, { status: 'success' }>['snapshot'];
			tariffs: SettingsTariffCatalogResult;
	  }
	| Exclude<SettingsSnapshotResult, { status: 'success' }>
> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		const config = getAuthBackendConfig();
		const flag = await readTariffFlag(config);
		const result = await readSettingsSnapshot(
			{ userId: session.data.userId, accessToken: session.data.accessToken },
			config,
			flag,
		);
		if (result.status !== 'success') return result;
		const tariffs = await readSettingsCatalog(
			result.tariffGate ?? { status: 'unavailable', showTariffs: false },
			config,
		);
		return { status: 'success', snapshot: result.snapshot, tariffs };
	} catch {
		return { status: 'error' };
	}
};
