export type LoginRequest = {
	username: string;
	password: string;
};

export type AuthPermission = {
	id: number;
	name: string;
};

export type AuthRole = {
	id: number;
	name: string;
	permissions: AuthPermission[];
};

// GetPublicUserResponse contract; dates are serialized as JSON strings.
export type AuthUser = {
	id: string;
	username: string;
	email: string;
	phone: string;
	country: string | null;
	city: string | null;
	birthday: string | null;
	address: string | null;
	avatarUrl: string | null;
	updatedAt: string;
	createdAt: string;
	userRoles: AuthRole[];
	isVerified: boolean;
	isEmailNotificationsEnable: boolean;
};

export type AuthResponse = {
	access_token: string;
	user: AuthUser;
};

// Normalized login identity; this is not the full backend profile.
export type LoginIdentity = {
	id: string;
	username: string;
	avatarUrl: string | null;
};

export type LoginResponse = {
	access_token: string;
	user: LoginIdentity;
};

// Refresh returns the same normalized identity as login, not a full profile.
export type RefreshResponse = {
	access_token: string;
	user: LoginIdentity;
};
