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
	const isEnabled = useFeatureFlag(featureId);

	if (!isEnabled) return <>{fallback}</>;

	return <>{children}</>;
};
