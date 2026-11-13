export type TelegramLoginPayload = {
	id: number;
	first_name: string;
	auth_date: number;
	hash: string;
	last_name?: string;
	username?: string;
	photo_url?: string;
};

export type TelegramMutationResult =
	| { status: 'success'; telegramUsername: string | null }
	| {
			status:
				| 'validation-error'
				| 'unauthenticated'
				| 'refresh-required'
				| 'invalid-telegram-data'
				| 'outdated-telegram-data'
				| 'already-linked'
				| 'linked-to-another-user'
				| 'not-linked'
				| 'unlink-forbidden'
				| 'forbidden'
				| 'not-found'
				| 'identity-mismatch'
				| 'error';
	  };
