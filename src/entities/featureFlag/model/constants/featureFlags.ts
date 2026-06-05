import { FeatureFlagType, FeatureFlags } from '../types/featureFlag';

export const FEATURE_FLAGS = {
	publicSubscriptionShowTariffs: 'public.subscription.show-tariffs',
} as const satisfies Record<string, FeatureFlagType>;

export const featureFlags: FeatureFlags = {
	[FEATURE_FLAGS.publicSubscriptionShowTariffs]: {
		id: FEATURE_FLAGS.publicSubscriptionShowTariffs,
		enabled: false,
		description: 'Показ кнопки тарифов на лендинге',
	},
};

export const featureFlagApiUrls = {
	getFeatureFlagsList: 'feature-flags',
};

export const isFeatureFlagType = (flag: string): flag is FeatureFlagType =>
	Object.values(FEATURE_FLAGS).includes(flag as FeatureFlagType);
