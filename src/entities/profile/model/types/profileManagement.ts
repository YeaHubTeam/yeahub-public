export type ProfileSelectionFailure = {
	status:
		| 'unauthenticated'
		| 'refresh-required'
		| 'forbidden'
		| 'not-found'
		| 'incomplete'
		| 'outcome-unknown'
		| 'error';
};
export type ProfileSelectionResult =
	| { status: 'success'; profileId: string; specializationId: number; changed: boolean }
	| ProfileSelectionFailure;
export type SettingsProfileSelectionResult =
	| { status: 'success'; href: string }
	| ProfileSelectionFailure
	| { status: 'navigation-unavailable' };

export type ProfileCreationFailure = {
	status:
		| 'unauthenticated'
		| 'refresh-required'
		| 'limit-reached'
		| 'unfinished-profile-exists'
		| 'forbidden'
		| 'incomplete'
		| 'outcome-unknown'
		| 'error';
};
export type ProfileCreationResult =
	| { status: 'success'; profileId: string }
	| ProfileCreationFailure;
export type SettingsProfileCreationResult =
	| { status: 'success'; href: '/profile/edit' }
	| ProfileCreationFailure;

export type ProfileDeletionResult = {
	status:
		| 'success'
		| 'unauthenticated'
		| 'refresh-required'
		| 'invalid-input'
		| 'confirmation-mismatch'
		| 'forbidden'
		| 'last-profile'
		| 'active-profile'
		| 'incomplete'
		| 'outcome-unknown'
		| 'error';
};
