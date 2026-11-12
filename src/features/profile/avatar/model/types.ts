export type AvatarActionInput = { operation: 'set'; avatarImage: string } | { operation: 'delete' };
export type AvatarActionResult =
	| { status: 'success'; avatarUrl: string | null }
	| {
			status:
				| 'unauthenticated'
				| 'refresh-required'
				| 'forbidden'
				| 'validation-error'
				| 'identity-mismatch'
				| 'sync-required'
				| 'error';
	  };
export type AvatarAction = (input: AvatarActionInput) => Promise<AvatarActionResult>;
export type AvatarFileError = 'format' | 'size' | 'resolution';
