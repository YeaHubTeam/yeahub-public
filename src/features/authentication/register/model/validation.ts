import { RegistrationErrors, RegistrationValues, validateRegistration } from '@/entities/session';

// React registerSchema messages/onTouched; AUTH-02/DTO limits stay enforced by the base validator.
export const registrationFormErrors = (values: RegistrationValues): RegistrationErrors => {
	const errors = { ...validateRegistration(values).errors };
	const username = values.username.trim();
	if (!username) errors.username = 'registrationRequired';
	else if (username.length < 2) errors.username = 'registrationNameMin';
	else if (username.length > 30) errors.username = 'registrationNameMax';
	if (!values.email) errors.email = 'registrationRequired';
	else if (errors.email) errors.email = 'loginEmailInvalid';
	for (const field of ['password', 'passwordConfirmation'] as const) {
		const password = values[field];
		if (!password) errors[field] = 'registrationRequired';
		else if (field === 'passwordConfirmation' && password !== values.password)
			errors[field] = 'passwordMismatch';
		else if (password.length < 8) errors[field] = 'registrationPasswordMin';
		else if (password.length > 255) errors[field] = 'registrationPasswordMax';
		else if (
			validateRegistration({ ...values, password, passwordConfirmation: password }).errors.password
		)
			errors[field] = 'registrationPasswordWeak';
	}
	return errors;
};
