import 'server-only';

import { backendHttp } from '@/shared/api/index.server';

export const mutateQuestionFavorite = async (
	questionId: number,
	favorite: boolean,
	credentials: { profileId: string; accessToken: string },
	config: { apiOrigin: string; allowedOrigins: readonly string[] },
): Promise<boolean> => {
	const result = await backendHttp({
		config,
		path: `/questions/favorites/${encodeURIComponent(credentials.profileId)}/${questionId}`,
		method: favorite ? 'POST' : 'DELETE',
		effect: 'mutation',
		cache: 'no-store',
		timeoutMs: 5000,
		headers: { Authorization: `Bearer ${credentials.accessToken}` },
		decode: (response) => Promise.resolve(response.status === (favorite ? 201 : 204)),
	});
	return result.status === 'response' && result.value;
};
