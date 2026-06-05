import { Collection } from '@/entities/collection';
import { HhTopBySpecResponse } from '@/entities/hh';
import { Specialization } from '@/entities/specialization';
import { Flex } from '@/shared/ui/Flex';
import { Header } from '@/widgets/Specialization/Header';
import { KeywordsSection } from '@/widgets/Specialization/KeywordsSection';
import { SkillsSection } from '@/widgets/Specialization/SkillsSection';
import { SpecializationCollections } from '@/widgets/Specialization/SpecializationCollections';
import { TasksSection } from '@/widgets/Specialization/TasksSection';

import styles from './SpecializationPage.module.css';

interface SpecializationPageProps {
	specialization: Specialization;
	locale: string;
	specAnalytics: HhTopBySpecResponse;
	collections: Collection[];
}

export const SpecializationPage = ({
	specialization,
	specAnalytics,
	collections,
	locale,
}: SpecializationPageProps) => {
	return (
		<Flex direction="column" gap="40" className={styles.container}>
			<Header specialization={specialization} />
			<SkillsSection skills={specAnalytics.skills} />
			<KeywordsSection keywords={specAnalytics.keywords} />
			<TasksSection locale={locale} />
			<SpecializationCollections
				collections={collections}
				specializationSlug={specialization.slug}
				locale={locale}
			/>
		</Flex>
	);
};
