import { AboutQuestionsBlock } from '@/widgets/Landing/AboutQuestionsBlock';
import { BannerBlock } from '@/widgets/Landing/BannerBlock';
import { CollectionBlock } from '@/widgets/Landing/CollectionBlock';
import { InterviewTrainerBlock } from '@/widgets/Landing/InterviewTrainerBlock';
import { SpecializationBlock } from '@/widgets/Landing/SpecialityBlock';

export const LandingPage = () => {
	return (
		<>
			<BannerBlock />
			<SpecializationBlock />
			<AboutQuestionsBlock />
			<InterviewTrainerBlock />
			<CollectionBlock />
		</>
	);
};
