import { Flex } from '@/shared/ui/Flex';
import { DifficultySection } from '@/widgets/NewLanding/DifficultySection';
import { PrepareForInterviewSection } from '@/widgets/NewLanding/PrepareForInterviewSection';
import { TrainerProgressSection } from '@/widgets/NewLanding/TrainerProgressSection';
import { TrainingSection } from '@/widgets/NewLanding/TrainingSection';

export const NewLandingPage = () => {
	return (
		<Flex direction="column" gap="80">
			<DifficultySection />
			<PrepareForInterviewSection />
			<TrainerProgressSection />
			<TrainingSection />
		</Flex>
	);
};
