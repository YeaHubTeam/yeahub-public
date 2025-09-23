import { ROUTES } from '@/shared/config/router/routes';

import { HeaderNavLinks } from '../types/headerTypes';

export const HEADER_NAV_LINKS: HeaderNavLinks[] = [
	{
		link: ROUTES.questions.page,
		path: '/questions/',
		title: 'header.nav.questions',
	},
	{
		link: ROUTES.quiz.page,
		path: '/quiz/',
		title: 'header.nav.quiz',
	},
	{
		link: ROUTES.collections.page,
		path: '/collections/',
		title: 'header.nav.collections',
	},
];

export const AUTH_LINKS = {
	login: 'https://yeahub.ru/auth/login',
	register: 'https://yeahub.ru/auth/register',
};
