import { Collection } from '@/entities/collection';
import { HhTopBySpecResponse } from '@/entities/hh';
import { getQuestionsList } from '@/entities/question';
import { Specialization } from '@/entities/specialization';
import { Flex } from '@/shared/ui/Flex';
import { CollectionsSection } from '@/widgets/Specialization/CollectionsSection';
import { Header } from '@/widgets/Specialization/Header';
import { KeywordsSection } from '@/widgets/Specialization/KeywordsSection';
import { SkillsSection } from '@/widgets/Specialization/SkillsSection';
import { TasksSection } from '@/widgets/Specialization/TasksSection';
import { QuestionsBlock } from '@/widgets/question/SpecializationsQuestionBlock';

import styles from './SpecializationPage.module.css';

interface SpecializationPageProps {
	specialization: Specialization;
	locale: string;
	specAnalytics?: HhTopBySpecResponse;
	collections: Collection[];
}
const FIRST_PAGE = 1;
const MAX_QUSTIONS_COUNT = 4;

export const SpecializationPage = async ({
	specialization,
	specAnalytics,
	collections,
	locale,
}: SpecializationPageProps) => {
	const questionsResponse = await getQuestionsList({
		page: FIRST_PAGE,
		limit: MAX_QUSTIONS_COUNT,
		specializationId: specialization.id,
	});
	return (
		<Flex direction="column" gap="40" className={styles.container}>
			<Header specialization={specialization} />
			<SkillsSection skills={specAnalytics?.skills} />
			<KeywordsSection keywords={specAnalytics?.keywords} />
			<QuestionsBlock
				locale={locale}
				specialization={specialization.slug}
				questions={questionsResponse.data}
			/>
			<CollectionsSection
				collections={collections}
				specializationSlug={specialization.slug}
				locale={locale}
			/>
			<TasksSection locale={locale} />
		</Flex>
	);
};
