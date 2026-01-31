import type { Answers } from '../types/quiz';

export function checkAllQuestionsAnswered(questions: Answers[]): boolean {
	return questions.every((q: Answers) => q.answer != null);
}
