import { Articles } from '@/shared/config';

import { ArticleContentType } from '../types/article';

export const articleApiUrls = {
	getArticlesList: 'articles/public-articles',
};

export const MAX_SHOW_LIMIT_ARTICLES = 10;

export const articleContentTypeMap: Record<ArticleContentType, Articles> = {
	theory: Articles.CONTENT_TYPE_THEORY,
	practice: Articles.CONTENT_TYPE_PRACTICE,
	interview: Articles.CONTENT_TYPE_INTERVIEW,
	roadmap: Articles.CONTENT_TYPE_ROADMAP,
	case_study: Articles.CONTENT_TYPE_CASE_STUDY,
};
