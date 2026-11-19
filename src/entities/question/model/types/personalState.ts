export type QuestionPersonalState = {
	questionId: number;
	checksCount: number;
	isLearned: boolean;
	isFavorite: boolean;
};

export type QuestionPersonalStateResult =
	| {
			status: 'success';
			userId: string;
			profileId: string;
			isVerified?: boolean;
			hasPremiumAccess?: boolean;
			state: QuestionPersonalState;
	  }
	| {
			status:
				| 'unauthenticated'
				| 'refresh-required'
				| 'no-active-profile'
				| 'identity-mismatch'
				| 'forbidden'
				| 'not-found'
				| 'invalid-input'
				| 'error';
	  };
