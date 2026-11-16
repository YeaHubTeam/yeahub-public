import * as yup from 'yup';

interface SkillsValidationMessages {
	required: string;
	invalid: string;
	duplicate: string;
}
export const createSkillsSchema = (messages: SkillsValidationMessages) =>
	yup.object({
		profileSkills: yup
			.array()
			.typeError(messages.invalid)
			.of(
				yup
					.mixed<number>()
					.defined(messages.invalid)
					.test(
						'skill-id',
						messages.invalid,
						(id) => typeof id === 'number' && Number.isSafeInteger(id) && id > 0,
					),
			)
			.required(messages.required)
			.test('unique-skills', messages.duplicate, (ids) => !ids || new Set(ids).size === ids.length),
	});
