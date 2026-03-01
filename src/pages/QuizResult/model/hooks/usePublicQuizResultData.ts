import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Answers, LS_ACTIVE_MOCK_QUIZ_KEY } from '@/entities/quiz';
import { getJSONFromLS } from '@/shared/libs';

export const usePublicQuizResultData = () => {
	const [quizAnswers, setQuizAnswers] = useState<Answers[] | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;

		try {
			const data = getJSONFromLS(LS_ACTIVE_MOCK_QUIZ_KEY);
			if (!data) {
				router.push('/');
				return;
			}
			const answers = data?.response?.answers;
			if (!Array.isArray(answers)) {
				throw new Error('Invalid format of questions data in localStorage');
			}
			setQuizAnswers(answers);
			timer = setTimeout(() => setIsLoading(false), 800);
		} catch (error) {
			console.error('Failed to load questions from localStorage:', error);
			router.push('/');
			setIsLoading(false);
		}

		return () => clearTimeout(timer);
	}, []);

	return { quizAnswers, isLoading };
};
