export type ProfileEditInput = {
	// Optional precondition for legacy saves; required when initially assigning specialization.
	expectedProfileId?: string;
	specializationId?: number;
	username: string;
	city: string | null;
	socialNetwork: { code: string; title: string }[];
	description?: string;
	profileSkills: number[];
};

export type ProfileEditResult =
	| { status: 'success' }
	| { status: 'validation-error' | 'unauthorized' | 'forbidden' | 'error' | 'sync-required' }
	| {
			status: 'partial-success';
			profile: 'confirmed' | 'unconfirmed';
			user: 'not-attempted' | 'unconfirmed';
			reason: 'unauthorized' | 'forbidden' | 'error';
	  };
