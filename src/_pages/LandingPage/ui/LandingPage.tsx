import { Collection } from '@/entities/collection';
import { Company } from '@/entities/company';
import { Skill } from '@/entities/skill';
import { AboutQuestionsBlock } from '@/widgets/Landing/AboutQuestionsBlock';
import { BannerBlock } from '@/widgets/Landing/BannerBlock';
import { CollectionBlock } from '@/widgets/Landing/CollectionBlock';
import { DifficultyBlock } from '@/widgets/Landing/DifficultyBlock';
import { HistoryBlock } from '@/widgets/Landing/HistoryBlock';
import { InterviewTrainerBlock } from '@/widgets/Landing/InterviewTrainerBlock';
import { SpecializationBlock } from '@/widgets/Landing/SpecialityBlock';

interface LandingPageProps {
	skills: Skill[];
	companies: Company[];
	collections: Collection[];
	locale: string;
}

export const LandingPage = ({ skills, companies, collections, locale }: LandingPageProps) => {
	return (
		<>
			<BannerBlock />
			<DifficultyBlock />
			<SpecializationBlock locale={locale} />
			<AboutQuestionsBlock skills={skills} locale={locale} />
			<InterviewTrainerBlock />
			<CollectionBlock companies={companies} collections={collections} locale={locale} />
			<HistoryBlock />
		</>
	);
};
