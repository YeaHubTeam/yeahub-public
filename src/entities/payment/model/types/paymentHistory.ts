export type PaymentHistoryResult =
	| {
			status: 'success';
			items: { dateLabel: string; isConfirmed: boolean }[];
			page: number;
			limit: 5;
			total: number;
	  }
	| {
			status: 'invalid-input' | 'unauthenticated' | 'refresh-required' | 'forbidden' | 'error';
	  };
