'use client';

import { ReactNode, createContext, useContext } from 'react';

import { FeatureFlagType, FeatureFlags } from '../../model/types/featureFlag';

const FeatureFlagContext = createContext<FeatureFlags>({});

interface FeatureFlagProviderProps {
	children: ReactNode;
	flags: FeatureFlags;
}

export const FeatureFlagProvider = ({ children, flags }: FeatureFlagProviderProps) => (
	<FeatureFlagContext.Provider value={flags}>{children}</FeatureFlagContext.Provider>
);

export const useFeatureFlag = (featureId: FeatureFlagType): boolean =>
	useContext(FeatureFlagContext)[featureId] ?? false;
