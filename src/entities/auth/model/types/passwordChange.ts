export type ChangePasswordResult =
	| { status: 'success' }
	| {
			status:
				| 'validation-error'
				| 'unauthenticated'
				| 'refresh-required'
				| 'forbidden'
				| 'not-found'
				| 'error';
	  }
	| {
			status: 'incomplete';
			stage: 'backend-result-unverified' | 'session-update-failed' | 'deadline-expired';
	  }
	| { status: 'outcome-unknown' };
