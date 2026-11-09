import * as yup from 'yup';

import { emailRule, passwordRules } from '@/shared/libs';

interface RegisterValidationMessages {
	required: string;
	email: string;
	minUsernameLength: string;
	maxUsernameLength: string;
	minPasswordLength: string;
	passwordWeak: string;
	passwordSimilar: string;
	privacy: string;
}

export const createRegisterSchema = ({
	required,
	email,
	minUsernameLength,
	maxUsernameLength,
	minPasswordLength,
	passwordWeak,
	passwordSimilar,
	privacy,
}: RegisterValidationMessages) =>
	yup.object().shape({
		username: yup
			.string()
			.trim()
			.min(2, minUsernameLength)
			.max(30, maxUsernameLength)
			.required(required),
		email: yup.string().matches(emailRule, email).required(required),
		password: yup
			.string()
			.min(8, minPasswordLength)
			.matches(passwordRules, passwordWeak)
			.required(required),
		passwordConfirmation: yup
			.string()
			.min(8, minPasswordLength)
			.matches(passwordRules, passwordWeak)
			.oneOf([yup.ref('password')], passwordSimilar)
			.required(required),
		privacyConsent: yup.boolean().oneOf([true], privacy).required(required),
		offerConsent: yup.boolean().oneOf([true], privacy).required(required),
	});
