export interface LoginValues {
	username: string;
	password: string;
}
export type LoginErrors = Partial<Record<keyof LoginValues, 'loginRequired' | 'loginEmailInvalid'>>;

// Правила React widgets/authentication/login/lib/validation/loginSchema.ts.
export const validateLogin = ({ username, password }: LoginValues): LoginErrors => {
	const errors: LoginErrors = {};
	if (!username.trim()) errors.username = 'loginRequired';
	else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(username.trim()))
		errors.username = 'loginEmailInvalid';
	if (!password) errors.password = 'loginRequired';
	return errors;
};
