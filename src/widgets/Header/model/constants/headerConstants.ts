import { Header, ROUTES } from '@/shared/config';
import { DEFAULT_SPECIALIZATION_SLUG, route } from '@/shared/libs';

import { NavLink } from '../types/headerTypes';

export const HEADER_NAV_LINKS: NavLink[] = [
	{
		id: 'interview',
		title: Header.NAV_INTERVIEW,
		subitems: [
			{
				link: route(ROUTES.questions.page, DEFAULT_SPECIALIZATION_SLUG),
				path: '/questions',
				title: Header.NAV_QUESTIONS,
				icon: 'question',
			},
			{
				link: route(ROUTES.collections.page, DEFAULT_SPECIALIZATION_SLUG),
				path: '/collections',
				title: Header.NAV_COMPANIES,
				icon: 'companies',
			},
			{
				link: ROUTES.tasks.page,
				path: '/tasks',
				title: Header.NAV_TASKS,
				icon: 'collection',
			},
		],
	},
	{
		id: 'training',
		title: Header.NAV_LEARNING,
		subitems: [
			{
				link: ROUTES.quiz.new.page,
				path: '/quiz',
				title: Header.NAV_TRAINER,
				icon: 'quiz',
			},
			{
				link: route(ROUTES.resources.page, DEFAULT_SPECIALIZATION_SLUG),
				path: '/resources',
				title: Header.NAV_RESOURCES,
				icon: 'list',
			},
			{
				link: ROUTES.learning.page,
				path: '/learning',
				title: Header.NAV_MENTORS,
				icon: 'user',
			},
		],
	},
	{
		id: 'cv',
		title: Header.NAV_RESUME,
		subitems: [
			{
				link: ROUTES.hhAnalytics.page,
				path: '/hh-analytics',
				title: Header.NAV_HH_ANALYTICS,
				icon: 'skills',
			},
			// { title: Header.NAV_ATS, link: '#', path: '#', icon: 'clipboardText' },
			{
				title: Header.NAV_VACANCIES,
				link: ROUTES.vacancies.page,
				path: '/vacancies',
				icon: 'clipboardText',
			},
		],
	},
];

export const INVERTED_THEME_URLS = [''] as const;
