import { apiFetch } from '@/shared/api';

import type { GetSpecializationsListResponse } from '../model/types/specialization';

export interface GetSpecializationsParams {
	limit?: number;
	offset?: number;
}

export function getSpecializations({ limit, offset = 0 }: GetSpecializationsParams) {
	return apiFetch<GetSpecializationsListResponse>('specializations', {
		searchParams: {
			limit: limit ?? 20,
			offset: offset ?? 0,
		},
	});
}
