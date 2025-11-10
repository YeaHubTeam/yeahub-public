import { useEffect, useState } from 'react';

import { GetSkillsParams, getSkills } from '../../api/getSkills';
import type { GetSkillsListResponse } from '../../model/types/skill';

export const useSkills = ({ limit, specializations }: GetSkillsParams) => {
	const [data, setData] = useState<GetSkillsListResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		let active = true;

		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await getSkills({ limit, specializations });
				if (active) setData(response);
			} catch (err) {
				if (active) setError(err);
			} finally {
				if (active) setLoading(false);
			}
		};

		void load();
		return () => {
			active = false;
		};
	}, [limit, specializations]);

	return { data, loading, error };
};
