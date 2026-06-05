import { Response } from '@/shared/libs';

export type FeatureFlagType = 'public.subscription.show-tariffs';

export interface FeatureFlag {
	id: FeatureFlagType;
	enabled: boolean;
	description: string;
}

export type FeatureFlags = Partial<Record<FeatureFlagType, FeatureFlag>>;

export type ClientType = 'WEB' | 'IOS' | 'ANDROID';

export type GetFeatureFlagsListResponse = Response<FeatureFlagApiItem[]>;

export type Flag = string;

export interface FeatureFlagApiItem {
	id: string;
	flag: Flag;
	enabled: boolean;
	description: string;
	clientType: ClientType;
	createdAt: string;
	updatedAt: string;
}

export interface GetFeatureFlagsListParamsRequest {
	page?: number;
	limit?: number;
	search?: string;
	enabled?: boolean;
	clientType?: ClientType;
}
