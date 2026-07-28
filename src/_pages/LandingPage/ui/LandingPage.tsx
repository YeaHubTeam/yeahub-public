import { Flex } from '@/shared/ui/Flex';
import { DifficultySection } from '@/widgets/Landing/Difficulty';
import { HeaderSection } from '@/widgets/Landing/Header';
import { InterviewSection } from '@/widgets/Landing/Interview';
import { PrepareForInterviewSection } from '@/widgets/Landing/PrepareForInterview';
import { ResumeSection } from '@/widgets/Landing/Resume';
import { TrainerProgressSection } from '@/widgets/Landing/TrainerProgress';
import { TrainingSection } from '@/widgets/Landing/Training';

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
