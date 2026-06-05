'use client';

import { ReactNode } from 'react';

import { FeatureFlagType } from '../../model/types/featureFlag';
import { useFeatureFlag } from '../FeatureFlagProvider/FeatureFlagProvider';

interface WithFeatureProps {
	featureId: FeatureFlagType;
	fallback?: ReactNode;
	children?: ReactNode;
}

export const WithFeature = ({ featureId, fallback = null, children }: WithFeatureProps) => {
	const featureFlag = useFeatureFlag(featureId);

	if (!featureFlag) return <>{fallback}</>;

	const isEnabled = featureFlag.enabled;

	if (!isEnabled) return <>{fallback}</>;

	return <>{children}</>;
};
