import { ProfileQuestionsStat } from '@/entities/quiz';
import { InterviewStatistics, ROUTES } from '@/shared/config';

export const getQuestionsStats = (
	t: (key: string) => string,
	questionsStat?: ProfileQuestionsStat,
) => [
	{
		title: t(InterviewStatistics.QUESTION_STATS_ALL),
		value: String(questionsStat?.uniqueQuestionsCount ?? 0),
		route: questionsStat ? `${ROUTES.wiki.questions.page}?page=1&status=all` : undefined,
	},
	{
		title: t(InterviewStatistics.QUESTION_STATS_NEW),
		value: String(questionsStat?.unlearnedQuestionsCount ?? 0),
		route: questionsStat ? `${ROUTES.wiki.questions.page}?page=1&status=not-learned` : undefined,
	},
	{
		title: t(InterviewStatistics.QUESTION_STATS_IN_PROCESS),
		value: String(questionsStat?.inProgressQuestionsCount ?? 0),
		route: questionsStat ? `${ROUTES.wiki.questions.page}?page=1&status=not-learned` : undefined,
	},
	{
		title: t(InterviewStatistics.QUESTION_STATS_LEARNED),
		value: String(questionsStat?.learnedQuestionsCount ?? 0),
		route: questionsStat ? `${ROUTES.wiki.questions.page}?page=1&status=learned` : undefined,
	},
];
