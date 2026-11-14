export type SubscriptionCancellationResult =
	| {
			status: 'success';
			subscription: {
				state: 'canceled';
				daysLeft: number;
				daysInCreationMonth: number;
				endDateLabel: string;
			};
	  }
	| {
			status:
				| 'invalid-input'
				| 'unauthenticated'
				| 'refresh-required'
				| 'verification-required'
				| 'not-available'
				| 'forbidden'
				| 'conflict'
				| 'incomplete'
				| 'outcome-unknown'
				| 'error';
	  };
