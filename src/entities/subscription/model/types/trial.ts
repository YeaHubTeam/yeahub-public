export type TrialResult =
	| { status: 'success' }
	| {
			status:
				| 'unauthenticated'
				| 'refresh-required'
				| 'verification-required'
				| 'not-eligible'
				| 'forbidden'
				| 'conflict'
				| 'incomplete'
				| 'outcome-unknown'
				| 'error';
	  };
