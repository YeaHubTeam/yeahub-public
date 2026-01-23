import type { Question } from '@/entities/question';

import type { Answers, CreateNewMockQuizResponse } from '../types/quiz';

export function combineQuizQuestions(quiz: CreateNewMockQuizResponse | null) {
	if (!quiz) return [];

	return quiz.questions.map((question: Question) => ({
		...question,
		questionId: question.id,
		questionTitle: question.title,
		imageSrc: question.imageSrc ?? undefined,
		answer: quiz.response.answers.find((a: Answers) => a.questionId === question.id)?.answer,
	}));
}
