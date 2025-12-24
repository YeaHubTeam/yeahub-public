import { Header, ROUTES } from '@/shared/config';

import { HeaderNavLinks } from '../types/headerTypes';

export const HEADER_NAV_LINKS: HeaderNavLinks[] = [
	{
		link: ROUTES.questions.page,
		path: '/questions',
		title: Header.NAV_QUESTIONS,
	},
	{
		link: ROUTES.collections.page,
		path: '/collections',
		title: Header.NAV_COLLECTIONS,
	},
	{
		link: ROUTES.quiz.page,
		path: '/quiz',
		title: Header.NAV_TRAINER,
	},
];

export const AUTH_LINKS = {
	login: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login`,
	register: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/register`,
};
