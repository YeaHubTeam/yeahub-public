import 'server-only';

export { readTariffFlag, evaluateTariffGate } from './featureFlags.server';
export type { PublicBackendConfig, TariffGate, TariffFlagResult } from './featureFlags.server';

export { getTelegramWidgetConfig } from './telegram.server';

export { getAuthBackendConfig } from './authBackend.server';
