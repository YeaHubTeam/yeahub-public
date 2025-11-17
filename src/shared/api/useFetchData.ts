'use client';

import { useEffect, useState } from 'react';

interface UseFetchDataParams<T, P> {
	fetcher: (params: P) => Promise<T>;
	params: P;
	initialData: T | null;
}

export const useFetchData = <T, P>({ fetcher, params, initialData }: UseFetchDataParams<T, P>) => {
	const [data, setData] = useState<T | null>(initialData);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		let active = true;

		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await fetcher(params);
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
	}, [JSON.stringify(params)]);

	return { data, loading, error };
};
