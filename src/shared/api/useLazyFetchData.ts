'use client';

import { useEffect, useRef, useState } from 'react';

interface UseLazyFetchDataParams<T, P> {
	fetcher: (params: P) => Promise<T>;
	initialData: T | null;
	onSuccess?: (data: T) => void;
	onError?: (error: unknown) => void;
}

export const useLazyFetchData = <T, P>({
	fetcher,
	initialData,
	onSuccess,
	onError,
}: UseLazyFetchDataParams<T, P>) => {
	const [data, setData] = useState<T | null>(initialData);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);
	const controllerRef = useRef<boolean>(true);
	const load = async (params: P) => {
		setLoading(true);
		setError(null);
		try {
			controllerRef.current = true;
			const response = await fetcher(params);
			if (controllerRef.current) {
				setData(response);
				onSuccess?.(response);
			}
		} catch (err) {
			if (controllerRef.current) {
				setError(err);
				onError?.(err);
			}
		} finally {
			if (controllerRef.current) setLoading(false);
		}
	};

	useEffect(() => {
		return () => {
			controllerRef.current = false;
		};
	}, []);

	return { data, loading, error, fetch: load };
};
