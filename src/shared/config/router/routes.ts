export const ROUTES = {
	appRoute: '/',
	questions: {
		route: 'questions',
		page: '/questions',
		detail: {
			route: 'question/:slug',
			page: '/question/:slug',
		},
	},
	interview: {
		questions: {
			route: 'questions',
			page: process.env.NEXT_PUBLIC_SITE_URL + '/dashboard/interview/questions',
		},
	},
	users: {
		route: 'users',
		page: '/users',
		detail: {
			route: ':userId',
			page: '/users/:userId',
		},
	},
} as const;
