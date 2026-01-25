//eslint-disable-next-line
import type { ActiveQuizState } from '@/entities/quiz/model/types/quiz';
import { baseApi } from '@/lib/api';

export interface State {
	activeQuiz: ActiveQuizState;
	[baseApi.reducerPath]: ReturnType<typeof baseApi.reducer>;
}
