import { ResumeAnalysis } from '@/entities/vacancy';

import { ProfileProjectContext } from './ProfileProjectContext/ProfileProjectContext';
import { ProfileResumeStructure } from './ProfileResumeStructure/ProfileResumeStructure';
import { ProfileStack } from './ProfileStack/ProfileStack';
import styles from './ResumeAnalyzerProfile.module.css';

interface ResumeAnalyzerProfileProps {
	profile: ResumeAnalysis['profile'];
}

export const ResumeAnalyzerProfile = ({ profile }: ResumeAnalyzerProfileProps) => {
	return (
		<div className={styles.container}>
			<ProfileStack profile={profile} />
			<ProfileProjectContext profile={profile} />
			<ProfileResumeStructure profile={profile} />
		</div>
	);
};
