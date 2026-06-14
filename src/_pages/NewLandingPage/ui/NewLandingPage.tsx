import { Flex } from '@/shared/ui/Flex';
import { DifficultySection } from '@/widgets/NewLanding/DifficultySection';
import { PrepareForInterviewSection } from '@/widgets/NewLanding/PrepareForInterviewSection';
import { ResumeSection } from '@/widgets/NewLanding/ResumeSection';
import { TrainerProgressSection } from '@/widgets/NewLanding/TrainerProgressSection';

export const NewLandingPage = () => {
	return (
		<Flex direction="column" gap="80">
			<DifficultySection />
			<PrepareForInterviewSection />
			<TrainerProgressSection />
			<ResumeSection />
		</Flex>
	);
};
