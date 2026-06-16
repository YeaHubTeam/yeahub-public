import { Flex } from '@/shared/ui/Flex';
import { DifficultySection } from '@/widgets/NewLanding/DifficultySection';
import { InterviewSection } from '@/widgets/NewLanding/InterviewSection';
import { PrepareForInterviewSection } from '@/widgets/NewLanding/PrepareForInterviewSection';
import { TrainerProgressSection } from '@/widgets/NewLanding/TrainerProgressSection';

export const NewLandingPage = () => {
	return (
		<Flex direction="column" gap="80">
			<DifficultySection />
			<PrepareForInterviewSection />
			<TrainerProgressSection />
			<InterviewSection />
		</Flex>
	);
};
