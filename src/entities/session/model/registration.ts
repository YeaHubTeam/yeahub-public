// Правила существующего React registerSchema/regexp; максимум пароля — NestJS DTO.
export const emailRule = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const passwordRule =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};:'",./?\\|~])[A-Za-z\d!@#$%^&*()_+\-=[\]{};:'",./?\\|~]{8,}$/;

export interface RegistrationValues {
	username: string;
	email: string;
	password: string;
	passwordConfirmation: string;
	privacyConsent: boolean;
	offerConsent: boolean;
	adConsent: boolean;
	refId?: string;
}
export type RegistrationField = keyof RegistrationValues;
export type RegistrationErrors = Partial<Record<RegistrationField, string>>;

export const validateRegistration = (
	input: unknown,
): { values: RegistrationValues | null; errors: RegistrationErrors } => {
	const body =
		input && typeof input === 'object' && !Array.isArray(input)
			? (input as Record<string, unknown>)
			: {};
	const text = (key: string) => (typeof body[key] === 'string' ? body[key] : '');
	const values: RegistrationValues = {
		username: text('username').trim(),
		email: text('email'),
		password: text('password'),
		passwordConfirmation: text('passwordConfirmation'),
		privacyConsent: body.privacyConsent === true,
		offerConsent: body.offerConsent === true,
		adConsent: body.adConsent === true,
		...(body.refId !== undefined ? { refId: text('refId') } : {}),
	};
	const errors: RegistrationErrors = {};
	if (values.username.length < 2 || values.username.length > 30)
		errors.username = 'usernameInvalid';
	if (values.email.length > 320 || !emailRule.test(values.email)) errors.email = 'emailInvalid';
	if (values.password.length > 255 || !passwordRule.test(values.password))
		errors.password = 'passwordInvalid';
	if (values.passwordConfirmation !== values.password || !values.passwordConfirmation)
		errors.passwordConfirmation = 'passwordMismatch';
	if (!values.privacyConsent) errors.privacyConsent = 'consentRequired';
	if (!values.offerConsent) errors.offerConsent = 'consentRequired';
	if (body.adConsent !== undefined && typeof body.adConsent !== 'boolean')
		errors.adConsent = 'consentInvalid';
	if (
		body.refId !== undefined &&
		(typeof body.refId !== 'string' || (values.refId ?? '').length > 255)
	)
		errors.refId = 'referralInvalid';
	return { values: Object.keys(errors).length ? null : values, errors };
};
