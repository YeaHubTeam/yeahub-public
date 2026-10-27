import { apiFetch } from '@/shared/api';

import { MAX_SHOW_LIMIT_ARTICLES, articleApiUrls } from '../model/constants/article';
import type {
	GetPublicArticlesParamsRequest,
	GetPublicArticlesResponse,
} from '../model/types/article';

export async function getArticlesList(params?: GetPublicArticlesParamsRequest) {
	return apiFetch<GetPublicArticlesResponse>(articleApiUrls.getArticlesList, {
		searchParams: {
			...params,
			page: params?.page ?? 1,
			limit: params?.limit ?? MAX_SHOW_LIMIT_ARTICLES,
		},
	});
}
