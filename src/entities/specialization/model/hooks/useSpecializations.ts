import { useEffect, useState } from 'react';

import { GetSpecializationsParams, getSpecializations } from '../../api/getSpecializations';
import type { GetSpecializationsListResponse } from '../../model/types/specialization';

export const useSpecializations = ({ limit, offset = 0 }: GetSpecializationsParams) => {
	const [data, setData] = useState<GetSpecializationsListResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		let active = true;

		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await getSpecializations({ limit, offset });
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
	}, [limit, offset]);

	return { data, loading, error };
};
