import { configureStore } from '@reduxjs/toolkit';

import { activeQuizSlice } from '@/entities/quiz/slice/activeQuizSlice';

import { baseApi } from './api';

export const store = configureStore({
	reducer: {
		[baseApi.reducerPath]: baseApi.reducer,
		activeQuiz: activeQuizSlice.reducer,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
