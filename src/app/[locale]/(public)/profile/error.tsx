'use client';

import { ProfileStatus } from '../../_ui/ProfilePage/ProfileStatus';

const ProfileError = ({ reset }: { error: Error & { digest?: string }; reset: () => void }) => (
	<ProfileStatus kind="error" onRetry={reset} />
);

export default ProfileError;
