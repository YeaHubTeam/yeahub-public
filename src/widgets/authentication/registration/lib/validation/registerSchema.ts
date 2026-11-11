import * as yup from 'yup';

import { emailRule, passwordRules } from '@/shared/libs';

interface RegisterValidationMessages {
	required: string;
	email: string;
	minUsernameLength: string;
	maxUsernameLength: string;
	minPasswordLength: string;
	maxPasswordLength?: string;
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
	maxPasswordLength = passwordWeak,
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
		email: yup.string().trim().matches(emailRule, email).required(required),
		password: yup
			.string()
			.min(8, minPasswordLength)
			.max(255, maxPasswordLength)
			.matches(passwordRules, passwordWeak)
			.required(required),
		passwordConfirmation: yup
			.string()
			.min(8, minPasswordLength)
			.max(255, maxPasswordLength)
			.matches(passwordRules, passwordWeak)
			.oneOf([yup.ref('password')], passwordSimilar)
			.required(required),
		privacyConsent: yup
			.boolean()
			.strict()
			.typeError(privacy)
			.oneOf([true], privacy)
			.required(required),
		offerConsent: yup
			.boolean()
			.strict()
			.typeError(privacy)
			.oneOf([true], privacy)
			.required(required),
		adConsent: yup.boolean().strict().typeError(privacy).optional(),
	});
