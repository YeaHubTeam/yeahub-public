import { Header, ROUTES } from '@/shared/config';
import { route } from '@/shared/libs';

import { HeaderNavLinks } from '../types/headerTypes';

const initialSpecialization = 'react-frontend-developer';

export const HEADER_NAV_LINKS: HeaderNavLinks[] = [
	{
		link: route(ROUTES.questions.page, initialSpecialization),
		path: '/questions',
		title: Header.NAV_QUESTIONS,
	},
	{
		link: route(ROUTES.collections.page, initialSpecialization),
		path: '/collections',
		title: Header.NAV_COLLECTIONS,
	},
	{
		link: ROUTES.quiz.new.page,
		path: '/quiz',
		title: Header.NAV_TRAINER,
	},
	{
		link: route(ROUTES.resources.page, initialSpecialization),
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
