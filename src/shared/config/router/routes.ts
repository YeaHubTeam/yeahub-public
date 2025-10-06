export const ROUTES = {
	appRoute: '/',
	questions: {
		route: 'questions',
		page: '/questions',
		detail: {
			route: ':questionId',
			page: '/questions/:questionId',
		},
	},
} as const;
