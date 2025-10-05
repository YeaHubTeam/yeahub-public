import { Header } from '@/shared/config/i18n/i18nTranslations';
import { ROUTES } from '@/shared/config/router/routes';

import { HeaderNavLinks } from '../types/headerTypes';

export const HEADER_NAV_LINKS: HeaderNavLinks[] = [
	{
		link: ROUTES.questions.page,
		path: '/questions',
		title: Header.NAV_QUESTIONS,
	},
];

export const AUTH_LINKS = {
	login: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login`,
	register: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/register`,
};
