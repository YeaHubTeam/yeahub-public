export type PaymentInitInput = {
	tariffId: number;
	email: string;
	isOfferAgreed: boolean;
	isConsentAgreed: boolean;
};
export type PaymentInitResult =
	| { status: 'success'; paymentUrl: string }
	| {
			status:
				| 'invalid-input'
				| 'unauthenticated'
				| 'refresh-required'
				| 'verification-required'
				| 'not-available'
				| 'forbidden'
				| 'conflict'
				| 'outcome-unknown'
				| 'error';
	  };
