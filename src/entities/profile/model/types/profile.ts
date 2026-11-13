export type ProfileSkill = { id: number; title: string; imageSrc: string | null };
export type ActiveProfile = {
	id: string;
	specializationId: number;
	description: string | null;
	socialNetwork: { code: string; title: string }[];
	profileSkills: ProfileSkill[];
};
export type OwnProfile = {
	id: string;
	username: string;
	avatarUrl: string | null;
	birthday: string | null;
	country: string | null;
	city: string | null;
	email: string;
	isVerified: boolean;
	userRoles: { id: number; name: string }[];
	activeProfile: ActiveProfile;
};
export type OwnProfileResult =
	| { status: 'success'; profile: OwnProfile }
	| {
			status:
				| 'unauthenticated'
				| 'refresh-required'
				| 'no-active-profile'
				| 'identity-mismatch'
				| 'error';
	  };

export type HeaderProfile = {
	userId: string;
	avatarUrl: string | null;
	username: string;
	email: string | null;
};
export type HeaderProfileResult =
	| { status: 'success'; profile: HeaderProfile }
	| {
			status: 'unauthenticated' | 'refresh-required' | 'forbidden' | 'identity-mismatch' | 'error';
	  };
