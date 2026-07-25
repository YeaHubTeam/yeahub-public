import { Response } from '@/shared/libs';

export type FeatureFlagType = 'public.subscription.show-tariffs';

export type FeatureFlags = Partial<Record<FeatureFlagType, boolean>>;

export type ClientType = 'WEB' | 'IOS' | 'ANDROID';

export type GetFeatureFlagsListResponse = Response<FeatureFlagApiItem[]>;

export interface FeatureFlagApiItem {
	id: string;
	flag: string;
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
