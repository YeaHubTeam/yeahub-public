import { apiFetch } from '@/shared/api';

export interface HhTopBySpecResponse {
	skills: Array<{ title: string; count: number }>;
	keywords: Array<{ title: string; count: number }>;
	vacanciesCount?: number;
}

export const getHhTopBySpec = async (specializationId: number): Promise<HhTopBySpecResponse> => {
	try {
		const response = await apiFetch<HhTopBySpecResponse>(
			`/hh-parser/top-by-spec/${specializationId}`,
			{
				cacheStrategy: 'no-store',
				headers: {},
			},
		);

		return response;
	} catch (error: unknown) {
		if (process.env.NODE_ENV === 'development') {
			const mockData: HhTopBySpecResponse = {
				skills: Array.from({ length: 100 }, (_, i) => ({
					title: `Навык ${i + 1}`,
					count: Math.floor(Math.random() * 1000) + 100,
				})).sort((a, b) => b.count - a.count),
				keywords: Array.from({ length: 100 }, (_, i) => ({
					title: `Ключевое слово ${i + 1}`,
					count: Math.floor(Math.random() * 500) + 50,
				})).sort((a, b) => b.count - a.count),
				vacanciesCount: 500,
			};

			return mockData;
		}

		throw error;
	}
};
