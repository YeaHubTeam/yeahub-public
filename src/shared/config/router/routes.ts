export const ROUTES = {
	appRoute: '/',
	questions: {
		route: 'questions',
		page: '/questions',
		detail: {
			route: 'question/:id',
			page: '/question/:id',
		},
	},
	interview: {
		questions: {
			route: 'questions',
			page: process.env.NEXT_PUBLIC_SITE_URL + '/dashboard/interview/questions',
		},
	},
} as const;
