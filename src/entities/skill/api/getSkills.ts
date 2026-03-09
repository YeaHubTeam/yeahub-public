import { apiFetch } from '@/shared/api';

import type { GetSkillsListResponse } from '../model/types/skill';

export interface GetSkillsParams {
	limit?: number;
	specializations?: number | number[];
}

export function getSkills(params: GetSkillsParams) {
	const { specializations, ...rest } = params;
	const specializationValue = Array.isArray(specializations)
		? specializations.join(',')
		: specializations;

	return apiFetch<GetSkillsListResponse>('skills', {
		searchParams: { ...rest, specializations: specializationValue },
	});
}
