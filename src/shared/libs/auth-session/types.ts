declare const sessionIdBrand: unique symbol;

export type SessionId = string & { readonly [sessionIdBrand]: true };

// All timestamps are Unix seconds.
export type SessionLifetime = {
	createdAt: number;
	expiresAt: number;
};

export type SessionLifecycle = { status: 'active' } | { status: 'closed'; closedAt: number };

export type SessionMetadata = SessionLifetime & SessionLifecycle & { userId: string };

// Server-only data contract; do not re-export through the shared client public API.
export type SessionCredentials = {
	accessToken: string;
	refreshToken: string;
	accessTokenExpiresAt: number;
	refreshTokenExpiresAt: number;
};

// Storage must atomically match id, active status and version before rotation.
// Closing increments version; a late refresh must never recreate a closed record.
export type SessionRecord = SessionLifetime & {
	id: SessionId;
	userId: string;
	version: number;
} & (
		| { status: 'active'; credentials: SessionCredentials }
		| { status: 'closed'; closedAt: number; credentials?: never }
	);
