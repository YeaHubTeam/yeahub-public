
import { QuestionsAndTasksBlock } from "@/widgets/NewLanding/QuestionsAndTasks";

interface NewLandingPage {
	locale: string;
}

export const NewLandingPage = ({locale}: NewLandingPage) => {

	return(
		<>
			<QuestionsAndTasksBlock locale={locale} />
		</>
	)
}

import { Flex } from '@/shared/ui/Flex';
import { DifficultySection } from '@/widgets/NewLanding/DifficultySection';
import { PrepareForInterviewSection } from '@/widgets/NewLanding/PrepareForInterviewSection';
import { TrainerProgressSection } from '@/widgets/NewLanding/TrainerProgressSection';

export const NewLandingPage = () => {
	return (
		<Flex direction="column" gap="80">
			<DifficultySection />
			<PrepareForInterviewSection />
			<TrainerProgressSection />
		</Flex>
	);
};

