export const ROUTES = {
	appRoute: '/',
	login: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login`,
	register: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/register`,
	questions: {
		route: 'questions',
		page: '/questions',
		detail: {
			route: 'question/:id',
			page: '/question/',
		},
	},
	interview: {
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
	settings: {
		route: 'settings',
		page: process.env.NEXT_PUBLIC_SITE_URL + '/dashboard/settings',
	},
} as const;
