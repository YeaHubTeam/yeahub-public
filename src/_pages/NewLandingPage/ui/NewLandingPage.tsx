import { Flex } from '@/shared/ui/Flex';
import { DifficultySection } from '@/widgets/NewLanding/DifficultySection';
import { InterviewSection } from '@/widgets/NewLanding/InterviewSection';
import { PrepareForInterviewSection } from '@/widgets/NewLanding/PrepareForInterviewSection';
import { ResumeSection } from '@/widgets/NewLanding/ResumeSection';
import { TrainerProgressSection } from '@/widgets/NewLanding/TrainerProgressSection';
import { TrainingSection } from '@/widgets/NewLanding/TrainingSection';

export const NewLandingPage = () => {
	return (
		<Flex direction="column" gap="80">
			<DifficultySection />
			<PrepareForInterviewSection />
			<InterviewSection />
			<TrainerProgressSection />
			<TrainingSection />
			<ResumeSection />
		</Flex>
	);
};
