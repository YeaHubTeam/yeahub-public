import { Header, ROUTES } from '@/shared/config';
import { route } from '@/shared/libs';

import { HeaderNavLinks, PopoverColumn } from '../types/headerTypes';

const initialSpecialization = 'react-frontend-developer';

export const HEADER_NAV_LINKS: HeaderNavLinks[] = [
	{ id: 'interview', label: 'Собеседование', path: '/interview' },
	{ id: 'training', label: 'Обучение', path: '/training' },
	{ id: 'cv', label: 'Резюме', path: '/cv' },
];

export const POPOVER_COLUMNS: PopoverColumn[] = [
	{
		id: 'interview',
		title: 'Собеседование',
		subitems: [
			{
				link: route(ROUTES.questions.page, initialSpecialization),
				path: '/questions',
				title: Header.NAV_QUESTIONS,
				icon: 'question',
			},
			{
				link: '#',
				path: '#',
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
		title: 'Обучение',
		subitems: [
			{
				link: ROUTES.quiz.new.page,
				path: '/quiz',
				title: Header.NAV_TRAINER,
				icon: 'quiz',
			},
			{
				link: route(ROUTES.resources.page, initialSpecialization),
				path: '/resources',
				title: Header.NAV_RESOURCES,
				icon: 'list',
			},
			{
				link: ROUTES.learning.page,
				path: '/learning',
				title: Header.NAV_LEARNING,
				icon: 'user',
			},
		],
	},
	{
		id: 'cv',
		title: 'Резюме',
		subitems: [
			{
				link: ROUTES.hhAnalytics.page,
				path: '/hh-analytics',
				title: Header.NAV_HH_ANALYTICS,
				icon: 'skills',
			},
			{ title: Header.NAV_ATS, link: '#', path: '#', icon: 'clipboardText' },
		],
	},
];

export const INVERTED_THEME_URLS = [''] as const;
