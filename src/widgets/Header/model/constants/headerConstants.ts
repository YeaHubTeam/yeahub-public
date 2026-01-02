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
		link: ROUTES.resources.page,
		path: '/resources',
		title: Header.NAV_RESOURCES,
	},
  {
		link: ROUTES.learning.page,
		path: '/learning',
		title: Header.NAV_LEARNING,
  },
  {
		link: ROUTES.hhAnalytics.page,
		path: '/hh-analytics',
		title: Header.NAV_HH_ANALYTICS,
	},
];

export const AUTH_LINKS = {
	login: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login`,
	register: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/register`,
};
