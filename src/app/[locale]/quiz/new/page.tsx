import { createNewMockQuiz } from '@/entities/quiz';
import { QuizPage } from '@/pages/QuizPage';

interface PageProps {
	searchParams: Promise<{
		skills?: string;
		limit?: string;
		specialization?: string;
	}>;
}

const MainQuizPage = async ({ searchParams }: PageProps) => {
	const { specialization, skills, limit } = await searchParams;

	const mockQuiz = await createNewMockQuiz({
		skills,
		limit: Number(limit ?? 1),
		specialization: Number(specialization),
	});

	return <QuizPage mockQuiz={mockQuiz} />;
};

export default MainQuizPage;
