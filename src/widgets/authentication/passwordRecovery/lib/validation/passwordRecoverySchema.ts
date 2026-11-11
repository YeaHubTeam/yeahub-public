import * as yup from 'yup';

import { passwordRules } from '@/shared/libs';

interface PasswordRecoveryValidationMessages {
	required: string;
	minPasswordLength: string;
	maxPasswordLength: string;
	passwordWeak: string;
	passwordSimilar: string;
}

export const createPasswordRecoverySchema = ({
	required,
	minPasswordLength,
	maxPasswordLength,
	passwordWeak,
	passwordSimilar,
}: PasswordRecoveryValidationMessages) => {
	const password = yup
		.string()
		.strict()
		.typeError(required)
		.required(required)
		.min(8, minPasswordLength)
		.max(255, maxPasswordLength)
		.matches(passwordRules, passwordWeak);

	return yup.object().shape({
		password,
		confirmPassword: password.oneOf([yup.ref('password')], passwordSimilar),
	});
};
