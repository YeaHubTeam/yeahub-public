import { LS_ACTIVE_MOCK_QUIZ_KEY } from '../constants/quiz';
import type { CreateNewMockQuizResponse } from '../types/quiz';

export function readActiveMockQuiz(): CreateNewMockQuizResponse | null {
	try {
		const raw = localStorage.getItem(LS_ACTIVE_MOCK_QUIZ_KEY);

		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
