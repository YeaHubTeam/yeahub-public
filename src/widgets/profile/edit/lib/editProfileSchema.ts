import { StringSchema } from 'yup';

import { createAboutSchema } from './aboutSchema';
import { createPersonalSchema } from './personalSchema';
import { createSkillsSchema } from './skillsSchema';

export type EditValidationMessages = {
	personal: Parameters<typeof createPersonalSchema>[0];
	about: Parameters<typeof createAboutSchema>[0];
	skills: Parameters<typeof createSkillsSchema>[0];
};
export const createEditProfileSchema = (
	messages: EditValidationMessages,
	rawDescription: string | null,
	initialSpecializationId?: number,
) => {
	const about = createAboutSchema(messages.about, rawDescription ?? '');
	const description = about.fields.description;
	// The standalone About schema allows omission; the complete RHF draft always has this field.
	if (!(description instanceof StringSchema))
		throw new Error('Expected the existing description schema');
	const descriptionSchema: StringSchema<string | undefined> = description;
	return createPersonalSchema(messages.personal, initialSpecializationId)
		.concat(about.shape({ description: descriptionSchema.defined(messages.about.invalid) }))
		.concat(createSkillsSchema(messages.skills));
};
