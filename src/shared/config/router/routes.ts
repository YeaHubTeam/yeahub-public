export const ROUTES = {
	appRoute: '/',
	login: `${process.env.NEXT_PUBLIC_APP_SITE_URL}auth/login`,
	register: `${process.env.NEXT_PUBLIC_APP_SITE_URL}auth/register`,
	questions: {
		route: 'questions',
		page: '/questions/:specialization',
		detail: {
			route: 'questions/:specialization/:slug',
			page: '/questions/:specialization/:slug',
		},
	},
	resources: {
		route: 'resources',
		page: '/resources/:specialization',
	},
	interview: {
		route: 'interview',
		page: '/interview',
		questions: {
			route: 'questions',
			page: process.env.NEXT_PUBLIC_APP_SITE_URL + 'interview/questions',
		},
	},
	users: {
		page: process.env.NEXT_PUBLIC_APP_SITE_URL + 'users/',
	},
	collections: {
		route: 'collections',
		page: '/collections/:specialization',
		detail: {
			route: 'collections/:specialization/:slug',
			page: '/collections/:specialization/:slug',
		},
	},
	hhAnalytics: {
		route: 'hh-analytics',
		page: '/hh-analytics',
	},
	settings: {
		route: 'settings',
		page: process.env.NEXT_PUBLIC_APP_SITE_URL + 'settings',
	},
	avos: {
		route: 'avos',
		page: '/avos',
	},
	quiz: {
		route: 'quiz',
		page: '/quiz',
		new: {
			route: 'new',
			page: '/quiz/new',
		},
		result: {
			route: 'result',
			page: '/quiz/result',
		},
	},
	learning: {
		route: 'learning',
		page: '/learning',
	},
	mentor: {
		route: 'mentor',
		page: '/mentor',
	},
	wiki: {
		questions: {
			page: process.env.NEXT_PUBLIC_APP_SITE_URL + 'wiki/questions/:questionId',
		},
	},
} as const;
