import { LS_ACTIVE_MOCK_QUIZ_KEY, MockQuiz } from '@/entities/quiz';
import { ROUTES } from '@/shared/config';
import { getJSONFromLS, route } from '@/shared/libs';

interface GetQuestionLinksProps {
	locale: string;
	specializationId: number;
}

export const getQuestionLinks = ({
	locale,
	specializationId,
}: GetQuestionLinksProps): Map<number, string> => {
	const mockQuiz: MockQuiz | null = getJSONFromLS(LS_ACTIVE_MOCK_QUIZ_KEY);
	if (!mockQuiz?.questions?.length) return new Map();

	const specializationSlug = mockQuiz.questions[0].questionSpecializations?.find(
		(s) => s.id === specializationId,
	)?.slug;

	if (!specializationSlug) return new Map();

	return new Map(
		mockQuiz.questions
			.filter((q) => q.slug)
			.map((q) => [q.id, route(ROUTES.questions.detail.page, locale, specializationSlug, q.slug)]),
	);
};
