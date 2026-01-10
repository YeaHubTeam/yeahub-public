import { createNewMockQuiz } from '@/entities/quiz';
import { PublicQuizPage } from '@/pages/PublicQuiz';

interface PageProps {
	searchParams: Promise<{
		skills?: string;
		limit?: string;
		specialization?: string;
	}>;
}

const MainPublicQuizPage = async ({ searchParams }: PageProps) => {
	const { specialization, skills, limit } = await searchParams;

	const mockQuiz = await createNewMockQuiz({
		skills,
		limit: Number(limit ?? 1),
		specialization: Number(specialization),
	});

	return <PublicQuizPage mockQuiz={mockQuiz} />;
};

export default MainPublicQuizPage;
