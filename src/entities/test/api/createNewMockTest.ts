import { apiFetch } from '@/shared/api';

import { createTestApiUrls } from '../model/constants/test';
import type {
	CreateNewMockTestParamsRequest,
	CreateNewMockTestResponse,
} from '../model/types/test';

export async function createNewMockTest(params: CreateNewMockTestParamsRequest) {
	return apiFetch<CreateNewMockTestResponse>(createTestApiUrls.createNewMockTest, {
		method: 'GET',
		cacheStrategy: 'no-store',
		searchParams: { ...params },
	});
}
