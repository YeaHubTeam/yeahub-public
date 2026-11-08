import { emailRule, passwordRule } from './registration';

export const recoveryEmailError = (email: unknown): string | undefined => {
	if (typeof email !== 'string' || !email) return 'registrationRequired';
	return email.length > 320 || !emailRule.test(email) ? 'loginEmailInvalid' : undefined;
};
export interface RecoveryValues {
	password: string;
	passwordConfirm: string;
}
export const recoveryPasswordErrors = ({
	password,
	passwordConfirm,
}: RecoveryValues): Partial<Record<keyof RecoveryValues, string>> => {
	const errors: Partial<Record<keyof RecoveryValues, string>> = {};
	for (const [field, value] of Object.entries({ password, passwordConfirm })) {
		const key = field as keyof RecoveryValues;
		if (!value) errors[key] = 'registrationRequired';
		else if (field === 'passwordConfirm' && value !== password) errors[key] = 'passwordMismatch';
		else if (value.length < 8) errors[key] = 'registrationPasswordMin';
		else if (value.length > 255) errors[key] = 'registrationPasswordMax';
		else if (!passwordRule.test(value)) errors[key] = 'registrationPasswordWeak';
	}
	return errors;
};
// NestJS generateVerificationToken(): randomBytes(20).toString('hex'). Never a JWT.
export const validRecoveryToken = (value: unknown): value is string =>
	typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
