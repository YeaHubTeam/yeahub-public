import * as yup from 'yup';

import { passwordRules } from '@/shared/libs';

export const createChangePasswordSchema = (messages: {
	required: string;
	min: string;
	max: string;
	weak: string;
	similar: string;
}) => {
	const password = yup
		.string()
		.strict()
		.typeError(messages.required)
		.required(messages.required)
		.min(8, messages.min)
		.max(255, messages.max)
		.matches(passwordRules, messages.weak);
	return yup
		.object({
			password,
			passwordConfirm: password.test(
				'matches-password',
				messages.similar,
				(value, context) => !value || value === (context.parent as { password?: unknown }).password,
			),
		})
		.strict();
};
export type ChangePasswordValues = yup.InferType<ReturnType<typeof createChangePasswordSchema>>;
