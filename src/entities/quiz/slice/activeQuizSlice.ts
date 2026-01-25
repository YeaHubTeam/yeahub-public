import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { setToLS } from '@/shared/libs';

import { updateQuestionAnswer } from '../helpers/updateQuestionAnswer';
import { LS_ACTIVE_MOCK_QUIZ_KEY } from '../model/constants/quiz';
import { ActiveQuizState, Answers, ChangeQuestionAnswerParams } from '../model/types/quiz';

const initialState: ActiveQuizState = {
	questions: [],
};

export const activeQuizSlice = createSlice({
	name: 'quiz',
	initialState,
	reducers: {
		setActiveQuizQuestions: (state, action: PayloadAction<Answers[]>) => {
			const questions = action.payload;
			state.questions = questions;
		},
		changeQuestionAnswer: (state, action: PayloadAction<ChangeQuestionAnswerParams>) => {
			state.questions = updateQuestionAnswer(state.questions, action.payload);
		},
		clearActiveQuizState: (state) => {
			state.questions = [];
			setToLS(LS_ACTIVE_MOCK_QUIZ_KEY, {});
		},
	},
});

export const { setActiveQuizQuestions, changeQuestionAnswer, clearActiveQuizState } =
	activeQuizSlice.actions;
