import type { QuestionPersonalStateResult } from './personalState';

export type FavoriteQuestionInput = {
	questionId: number;
	expectedProfileId: string;
	favorite: boolean;
};
export type FavoriteQuestionResult = QuestionPersonalStateResult | { status: 'unverified' };
