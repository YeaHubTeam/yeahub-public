'use server';

import { changeOwnQuestionStudyProgress, setOwnQuestionFavorite, getOwnQuestionsList } from '@/app/_bff/question/index.server';
import type { FavoriteQuestionInput, QuestionStudyInput, PersonalQuestionsInput, PersonalNavigationPageResult } from '@/entities/question';

export async function setQuestionFavorite(input: FavoriteQuestionInput) {
	return setOwnQuestionFavorite(input);
}

export async function changeQuestionStudyProgress(input: QuestionStudyInput) {
	return changeOwnQuestionStudyProgress(input);
}

// Read-only navigation projection of the existing personalized list, never client identity.
export async function readQuestionNavigationPage(input: PersonalQuestionsInput): Promise<PersonalNavigationPageResult> {
	if (!input || !['favorite', 'learned', 'not-learned'].includes(input.status)) return { status: 'unavailable' };
	const result = await getOwnQuestionsList(input);
	if (result.status !== 'success') return { status: 'unavailable' };
	return {
		status: 'success', userId: result.userId, profileId: result.profileId,
		list: { ...result.list, data: result.list.data.map(({ id, slug }) => ({ id, slug })) },
	};
}
