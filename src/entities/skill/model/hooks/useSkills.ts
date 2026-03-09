import { useFetchData } from '@/shared/api';

import { GetSkillsParams, getSkills } from '../../api/getSkills';
import type { GetSkillsListResponse } from '../../model/types/skill';

export const useSkills = (params: GetSkillsParams, initialData?: GetSkillsListResponse | null) => {
	return useFetchData<GetSkillsListResponse, GetSkillsParams>({
		fetcher: getSkills,
		params,
		initialData: initialData ?? null,
	});
};
