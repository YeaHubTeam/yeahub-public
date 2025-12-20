import type { ResourceTypeCode } from '@/entities/resource';

export interface ResourcesFilterParams {
	name?: string;
	specialization?: number;
	page?: number;
	skills?: number[];
	types?: ResourceTypeCode[];
}
