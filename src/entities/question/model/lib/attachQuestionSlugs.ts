import { slugifyQuestionTitle } from '@/shared/libs';

import { Question } from '../types/question';
import { QuestionWithSlug } from '../types/question';

export const attachQuestionSlugs = (questions: Question[]): QuestionWithSlug[] => {
	const duplicates = new Map<string, number>();

	return questions.map((question) => {
		const baseSlug = slugifyQuestionTitle(question.title) || `question-${question.id}`;
		const count = duplicates.get(baseSlug) ?? 0;

		const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
		duplicates.set(baseSlug, count + 1);

		return { ...question, slug };
	});
};
