import { apiFetch } from '@/shared/api';

import type {
	GetSpecializationSlugsResponse,
	GetSpecializationsListResponse,
} from '../model/types/specialization';

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

export function getSpecializationSlugs() {
	return apiFetch<GetSpecializationSlugsResponse>('specializations/slugs');
}
