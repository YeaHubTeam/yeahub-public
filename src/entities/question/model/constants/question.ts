export const questionApiUrls = {
	getQuestionsList: 'questions/public-questions',
	getQuestionById: 'questions/public-questions/:questionId',
	getSlugs: 'questions/slugs',
	getQuestionBySlug: 'questions/by-slug/:slug',
};

export const QUESTIONS_COMPLEXITY = [
	{ id: 1, title: '1-3', value: [1, 2, 3] },
	{ id: 2, title: '4-6', value: [4, 5, 6] },
	{ id: 3, title: '7-8', value: [7, 8] },
	{ id: 4, title: '9-10', value: [9, 10] },
];
