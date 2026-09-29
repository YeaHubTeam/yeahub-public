import { ResumeAnalysis } from '@/entities/vacancy';
import { Flex } from '@/shared/ui/Flex';

import { ProfileProjectContext } from './ProfileProjectContext/ProfileProjectContext';
import { ProfileResumeStructure } from './ProfileResumeStructure/ProfileResumeStructure';
import { ProfileStack } from './ProfileStack/ProfileStack';
import styles from './ResumeAnalyzerProfile.module.css';

interface ResumeAnalyzerProfileProps {
	profile: ResumeAnalysis['profile'];
}

export const ResumeAnalyzerProfile = ({ profile }: ResumeAnalyzerProfileProps) => {
	return (
		<Flex gap="20" className={styles.container}>
			<ProfileStack profile={profile} />
			<ProfileProjectContext profile={profile} />
			<ProfileResumeStructure profile={profile} />
		</Flex>
	);
};
