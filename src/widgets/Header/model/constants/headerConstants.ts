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
		link: ROUTES.quiz.new.page,
		path: '/quiz',
		title: Header.NAV_TRAINER,
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
