import { ProfileAbout } from '@/widgets/profile/about';
import { ProfileSkills } from '@/widgets/profile/skills';
import { UserCard } from '@/widgets/profile/userCard';
import type { UserCardProps } from '@/widgets/profile/userCard';

import styles from './ProfilePage.module.css';
import { ProfileAccessBoundary } from './ProfileStatus';

type ProfilePageProps = Required<
	Pick<UserCardProps, 'profile' | 'specialization' | 'avatarAction'>
>;

const ProfilePage = ({ profile, specialization, avatarAction }: ProfilePageProps) => (
	<ProfileAccessBoundary userId={profile.id}>
		<div className={styles.content}>
			<UserCard profile={profile} specialization={specialization} avatarAction={avatarAction} />
			<ProfileAbout description={profile.activeProfile.description} />
			<ProfileSkills skillsList={profile.activeProfile.profileSkills} />
		</div>
	</ProfileAccessBoundary>
);

export default ProfilePage;
