import * as yup from 'yup';

import { emailRule } from '@/shared/libs';

interface ForgotPasswordValidationMessages {
	email: string;
	required: string;
	maxEmailLength: string;
}

export const createForgotPasswordSchema = ({
	email,
	required,
	maxEmailLength,
}: ForgotPasswordValidationMessages) =>
	yup.object().shape({
		username: yup
			.string()
			.trim()
			.matches(emailRule, { message: email, excludeEmptyString: true })
			.max(254, maxEmailLength)
			.required(required),
	});
