import { Collection } from '@/entities/collection';
import { Company } from '@/entities/company';
import { Skill } from '@/entities/skill';
import { AboutQuestionsBlock } from '@/widgets/Landing/AboutQuestionsBlock';
import { BannerBlock } from '@/widgets/Landing/BannerBlock';
import { CollectionBlock } from '@/widgets/Landing/CollectionBlock';
import { InterviewTrainerBlock } from '@/widgets/Landing/InterviewTrainerBlock';
import { SpecializationBlock } from '@/widgets/Landing/SpecialityBlock';

interface LandingPageProps {
	skills: Skill[];
	companies: Company[];
	collections: Collection[];
}

export const LandingPage = ({ skills, companies, collections }: LandingPageProps) => {
	return (
		<>
			<BannerBlock />
			<SpecializationBlock />
			<AboutQuestionsBlock skills={skills} />
			<InterviewTrainerBlock />
			<CollectionBlock companies={companies} collections={collections} />
		</>
	);
};
