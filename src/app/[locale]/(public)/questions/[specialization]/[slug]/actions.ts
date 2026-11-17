'use server';

import { changeOwnQuestionStudyProgress, setOwnQuestionFavorite } from '@/app/_bff/question/index.server';
import type { FavoriteQuestionInput, QuestionStudyInput } from '@/entities/question';

export async function setQuestionFavorite(input: FavoriteQuestionInput) {
	return setOwnQuestionFavorite(input);
}

export async function changeQuestionStudyProgress(input: QuestionStudyInput) {
	return changeOwnQuestionStudyProgress(input);
}
