import { Flex } from '@/shared/ui/Flex';
import { TrainerProgressBlock } from '@/widgets/Landing/TrainerProgressBlock';
import { DifficultySection } from '@/widgets/NewLanding/DifficultySection';
import { PrepareForInterviewSection } from '@/widgets/NewLanding/PrepareForInterviewSection';

export const NewLandingPage = () => {
	return (
		<Flex direction="column" gap="80">
			<DifficultySection />
			<PrepareForInterviewSection />
			<TrainerProgressBlock />
		</Flex>
	);
};
