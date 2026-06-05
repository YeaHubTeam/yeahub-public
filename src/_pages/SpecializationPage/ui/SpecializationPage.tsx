import { HhTopBySpecResponse } from '@/entities/hh';
import { Specialization } from '@/entities/specialization';
import { Flex } from '@/shared/ui/Flex';
import { Header } from '@/widgets/Specialization/Header';
import { KeywordsSection } from '@/widgets/Specialization/KeywordsSection';
import { SkillsSection } from '@/widgets/Specialization/SkillsSection';
import { TasksSection } from '@/widgets/Specialization/TasksSection';

import styles from './SpecializationPage.module.css';

interface SpecializationPageProps {
	specialization: Specialization;
	locale: string;
	specAnalytics: HhTopBySpecResponse;
}

export const SpecializationPage = ({
	specialization,
	specAnalytics,
	locale,
}: SpecializationPageProps) => {
	return (
		<Flex direction="column" gap="40" className={styles.container}>
			<Header specialization={specialization} />
			<SkillsSection skills={specAnalytics.skills} />
			<KeywordsSection keywords={specAnalytics.keywords} />
			<TasksSection locale={locale} />
		</Flex>
	);
};
