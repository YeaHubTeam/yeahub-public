import { apiFetch } from '@/shared/api';
import { route } from '@/shared/libs';

import { specializationApiUrls } from '../model/constants/specializationConstants';
import type {
	GetSpecializationSlugsResponse,
	GetSpecializationsListResponse,
	Specialization,
} from '../model/types/specialization';

export interface GetSpecializationsParams {
	limit?: number;
	offset?: number;
}

export function getSpecializations({ limit, offset = 0 }: GetSpecializationsParams) {
	return apiFetch<GetSpecializationsListResponse>(specializationApiUrls.getSpecializations, {
		searchParams: {
			limit: limit ?? 20,
			offset: offset ?? 0,
		},
	});
}

export function getSpecializationSlugs() {
	return apiFetch<GetSpecializationSlugsResponse>(specializationApiUrls.getSpecializationSlugs);
}

export function getSpecializationBySlug(slug: string) {
	return apiFetch<Specialization>(route(specializationApiUrls.getSpecializationBySlug, slug));
}
