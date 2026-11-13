import * as yup from 'yup';

import { PERSONAL_SOCIAL_CODES } from '@/features/profile/editPersonal';

interface PersonalValidationMessages {
	required: string;
	minUsernameLength: string;
	maxUsernameLength: string;
	socialNetwork: string;
}

const stringValue = (value: unknown, original: unknown) =>
	typeof original === 'string' ? value : original;

export const createPersonalSchema = (messages: PersonalValidationMessages) =>
	yup.object({
		username: yup
			.string()
			.transform(stringValue)
			.typeError(messages.required)
			.required(messages.required)
			.min(2, messages.minUsernameLength)
			.max(30, messages.maxUsernameLength),
		city: yup
			.string()
			.transform(stringValue)
			.typeError(messages.required)
			.defined(messages.required),
		socialNetwork: yup
			.array()
			.of(
				yup
					.object({
						code: yup
							.mixed<(typeof PERSONAL_SOCIAL_CODES)[number]>()
							.oneOf([...PERSONAL_SOCIAL_CODES], messages.socialNetwork)
							.required(messages.socialNetwork),
						title: yup
							.string()
							.transform(stringValue)
							.typeError(messages.socialNetwork)
							.defined(messages.socialNetwork),
					})
					.exact(messages.socialNetwork),
			)
			.required(messages.socialNetwork)
			.test(
				'unique-social-codes',
				messages.socialNetwork,
				(values) => !values || new Set(values.map((link) => link?.code)).size === values.length,
			),
	});
