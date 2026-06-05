import { HhTopBySpecResponse } from '@/entities/hh';
import { Specialization } from '@/entities/specialization';
import { Flex } from '@/shared/ui/Flex';
import { Header } from '@/widgets/Specialization/Header';
import { KeywordsSection } from '@/widgets/Specialization/KeywordsSection';
import { SkillsSection } from '@/widgets/Specialization/SkillsSection';

import styles from './SpecializationPage.module.css';

interface SpecializationPageProps {
	specialization: Specialization;
	specAnalytics: HhTopBySpecResponse;
}

export const SpecializationPage = ({ specialization, specAnalytics }: SpecializationPageProps) => {
	return (
		<Flex direction="column" gap="40" className={styles.container}>
			<Header specialization={specialization} />
			<SkillsSection skills={specAnalytics.skills} />
			<KeywordsSection keywords={specAnalytics.keywords} />
		</Flex>
	);
};
