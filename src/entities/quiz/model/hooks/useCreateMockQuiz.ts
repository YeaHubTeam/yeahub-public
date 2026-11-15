import { useLazyFetchData } from '@/shared/api';

import { createNewMockQuiz } from '../../api/createNewMockQuiz';
import type { CreateNewMockQuizParamsRequest, CreateNewMockQuizResponse } from '../types/quiz';

interface UseCreateMockQuizProps {
	onSuccess?: (data: CreateNewMockQuizResponse) => void;
}

export const useCreateMockQuiz = ({ onSuccess }: UseCreateMockQuizProps) => {
	return useLazyFetchData<CreateNewMockQuizResponse, CreateNewMockQuizParamsRequest>({
		fetcher: createNewMockQuiz,
		initialData: null,
		onSuccess,
	});
};
