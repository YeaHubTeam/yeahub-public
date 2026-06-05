'use client';

import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getFeatureFlagsList } from '../../api/featureFlagApi';
import { featureFlags } from '../../model/constants/featureFlags';
import { FeatureFlag, FeatureFlagType, FeatureFlags } from '../../model/types/featureFlag';

const FeatureFlagContext = createContext<FeatureFlags>(featureFlags);

interface FeatureFlagProviderProps {
	children: ReactNode;
}

export const FeatureFlagProvider = ({ children }: FeatureFlagProviderProps) => {
	const [flags, setFlags] = useState<FeatureFlags>(featureFlags);

	useEffect(() => {
		getFeatureFlagsList()
			.then((remoteFlags) => {
				setFlags((currentFlags) => ({ ...currentFlags, ...remoteFlags }));
			})
			.catch(() => {
				setFlags(featureFlags);
			});
	}, []);

	const value = useMemo(() => flags, [flags]);

	return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>;
};

export const useFeatureFlag = (featureId: FeatureFlagType): FeatureFlag | undefined => {
	const flags = useContext(FeatureFlagContext);

	return flags[featureId] ?? featureFlags[featureId];
};
