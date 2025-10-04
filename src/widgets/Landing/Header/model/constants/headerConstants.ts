import { Header } from '@/shared/config/i18n/i18nTranslations';
import { ROUTES } from '@/shared/config/router/routes';

import { HeaderNavLinks } from '../types/headerTypes';

export const HEADER_NAV_LINKS: HeaderNavLinks[] = [
	{
		link: ROUTES.questions.page,
		path: '/questions/',
		title: Header.NAV_QUESTIONS,
	},
	{
		link: ROUTES.quiz.page,
		path: '/quiz/',
		title: Header.NAV_QUIZ,
	},
	{
		link: ROUTES.collections.page,
		path: '/collections/',
		title: Header.NAV_COLLECTIONS,
	},
];

export const AUTH_LINKS = {
	login: 'https://yeahub.ru/auth/login',
	register: 'https://yeahub.ru/auth/register',
};
