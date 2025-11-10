const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface ApiRequestOptions extends RequestInit {
	cacheStrategy?: RequestCache;
	searchParams?: Record<string, string | number | boolean | undefined | string[]>;
}

const buildUrl = (path: string, searchParams?: ApiRequestOptions['searchParams']) => {
	const url = new URL(path, API_URL);
	if (searchParams) {
		Object.entries(searchParams).forEach(([key, value]) => {
			if (value === undefined || value === null || value === '') return;
			url.searchParams.set(key, String(value));
		});
	}
	return url.toString();
};

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
	const { cacheStrategy = 'force-cache', searchParams, headers, ...rest } = options;

	const response = await fetch(buildUrl(path, searchParams), {
		cache: cacheStrategy,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		...rest,
	});

	if (!response.ok) {
		throw new Error(`API request failed (${response.status})`, { cause: response });
	}

	return (await response.json()) as T;
}
