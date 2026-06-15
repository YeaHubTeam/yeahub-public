import { Collection } from '@/entities/collection';
import { gurus } from '@/entities/guru';
import { HhTopBySpecResponse } from '@/entities/hh';
import { Specialization } from '@/entities/specialization';
import { Flex } from '@/shared/ui/Flex';
import { CollectionsSection } from '@/widgets/Specialization/CollectionsSection';
import { GuruSection } from '@/widgets/Specialization/GuruSection';
import { Header } from '@/widgets/Specialization/Header';
import { KeywordsSection } from '@/widgets/Specialization/KeywordsSection';
import { QuestionsSection } from '@/widgets/Specialization/QuestionsSection';
import { ResourcesSection } from '@/widgets/Specialization/ResourcesSection';
import { SkillsSection } from '@/widgets/Specialization/SkillsSection';
import { TasksSection } from '@/widgets/Specialization/TasksSection';

import styles from './SpecializationPage.module.css';

interface SpecializationPageProps {
	specialization: Specialization;
	locale: string;
	specAnalytics?: HhTopBySpecResponse;
	collections: Collection[];
}

export const SpecializationPage = ({
	specialization,
	specAnalytics,
	collections,
	locale,
}: SpecializationPageProps) => {
	const hasGuru = gurus.find((g) => g.specializations.includes(specialization.id));
	return (
		<Flex direction="column" gap="40" className={styles.container}>
			<Header specialization={specialization} />
			<SkillsSection skills={specAnalytics?.skills} />
			<KeywordsSection keywords={specAnalytics?.keywords} />
			<QuestionsSection locale={locale} specialization={specialization} />
			<CollectionsSection
				collections={collections}
				specializationSlug={specialization.slug}
				locale={locale}
			/>
			<TasksSection locale={locale} />
			<ResourcesSection locale={locale} specialization={specialization} />

			{hasGuru && <GuruSection specializationId={specialization.id} />}
		</Flex>
	);
};
