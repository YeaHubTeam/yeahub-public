import { Flex } from '@/shared/ui/Flex';
import { DifficultySection } from '@/widgets/Landing/DifficultySection';
import { HeaderSection } from '@/widgets/Landing/HeaderSection';
import { InterviewSection } from '@/widgets/Landing/InterviewSection';
import { PrepareForInterviewSection } from '@/widgets/Landing/PrepareForInterviewSection';
import { ResumeSection } from '@/widgets/Landing/ResumeSection';
import { TrainerProgressSection } from '@/widgets/Landing/TrainerProgressSection';
import { TrainingSection } from '@/widgets/Landing/TrainingSection';

export const LandingPage = () => {
	return (
		<Flex direction="column" gap="80">
			<HeaderSection />
			<DifficultySection />
			<PrepareForInterviewSection />
			<InterviewSection />
			<TrainerProgressSection />
			<ResumeSection />
			<TrainingSection />
		</Flex>
	);
};
