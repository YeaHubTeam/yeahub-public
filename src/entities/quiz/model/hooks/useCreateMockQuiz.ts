import {
	CreateNewMockQuizParamsRequest,
	CreateNewMockQuizResponse,
	createNewMockQuiz,
} from '@/entities/quiz';
import { useLazyFetchData } from '@/shared/api';

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
