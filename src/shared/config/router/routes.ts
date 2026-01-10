export const ROUTES = {
	appRoute: '/',
	login: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login`,
	register: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/register`,
	questions: {
		route: 'questions',
		page: '/questions',
		detail: {
			route: 'question/:slug',
			page: '/question/:slug',
		},
	},
	resources: {
		route: 'resources',
		page: '/resources',
	},
	interview: {
		route: 'interview',
		page: '/dashboard/interview',
		questions: {
			route: 'questions',
			page: process.env.NEXT_PUBLIC_SITE_URL + '/dashboard/interview/questions',
		},
	},
	users: {
		page: process.env.NEXT_PUBLIC_SITE_URL + '/dashboard/users/',
	},
	collections: {
		route: 'collections',
		page: '/collections',
		detail: {
			route: 'collection',
			page: '/collection',
		},
	},
	hhAnalytics: {
		route: 'hh-analytics',
		page: '/hh-analytics',
	},
	settings: {
		route: 'settings',
		page: process.env.NEXT_PUBLIC_SITE_URL + '/dashboard/settings',
	},
	avos: {
		route: 'avos',
		page: '/avos',
	},
	quiz: {
		route: 'quiz',
		page: '/quiz',
		result: {
			route: 'result',
			page: '/quiz/result',
		},
	},
	learning: {
		route: 'learning',
		page: '/learning',
	},
} as const;
