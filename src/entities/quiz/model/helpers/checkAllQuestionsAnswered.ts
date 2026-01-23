import type { Answers, CreateNewMockQuizResponse } from '../types/quiz';

export function checkAllQuestionsAnswered(quiz: CreateNewMockQuizResponse): boolean {
	return quiz.response.answers.every((a: Answers) => a.answer != null);
}
