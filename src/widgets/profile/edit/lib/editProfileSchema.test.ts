import { yupResolver } from '@hookform/resolvers/yup';
import { createTranslator } from 'next-intl';
import profileMessages from 'public/locales/ru/profile.json';
import commonMessages from 'public/locales/ru/translation.json';

import { createEditProfileSchema } from './editProfileSchema';

const t = createTranslator({ locale: 'ru', messages: profileMessages });
const common = createTranslator({ locale: 'ru', messages: commonMessages });
const messages = {
	personal: {
		required: common('validation.required'),
		minUsernameLength: common('validation.length.min', { count: 2 }),
		maxUsernameLength: common('validation.length.max', { count: 30 }),
		socialNetwork: t('edit.validation.socialNetwork'),
	},
	about: {
		links: t('edit.about.validation.links'),
		maxBytes: t('edit.about.validation.maxBytes', { count: 65_536 }),
		invalid: t('edit.about.validation.invalid'),
	},
	skills: {
		required: common('validation.required'),
		invalid: t('edit.skills.validation.invalid'),
		duplicate: t('edit.skills.validation.duplicate'),
	},
};
const valid = {
	username: ' Name ',
	city: '',
	description: '',
	socialNetwork: [],
	profileSkills: [999],
};
it('composes all three schemas without modifying values', async () => {
	expect(await createEditProfileSchema(messages, null).validate(valid)).toEqual(valid);
});
it.each([
	{ username: 'x' },
	{ socialNetwork: [{ code: 'legacy', title: 'Unknown' }] },
	{ description: '<a href="https://example.invalid">Link</a>' },
	{ profileSkills: [0] },
	{ profileSkills: [999, 999] },
])('validates every tab (%#)', async (invalid) => {
	await expect(
		createEditProfileSchema(messages, null).validate({ ...valid, ...invalid }),
	).rejects.toThrow();
});
it.each([
	['x'.repeat(65_536), true],
	['x'.repeat(65_537), false],
	['я'.repeat(32_768), true],
	['я'.repeat(32_768) + 'x', false],
] as const)('checks changed UTF-8 bytes (%#)', async (description, accepted) => {
	expect(
		await createEditProfileSchema(messages, 'Original').isValid({ ...valid, description }),
	).toBe(accepted);
});
it('accepts an unchanged legacy description and an empty skills list', async () => {
	const description = 'я'.repeat(65_536);
	expect(
		await createEditProfileSchema(messages, description).validate({
			...valid,
			description,
			profileSkills: [],
		}),
	).toMatchObject({ description, profileSkills: [] });
});
it('is compatible with yupResolver and requires description as a string in the complete draft', async () => {
	const resolver = yupResolver(createEditProfileSchema(messages, null));
	expect(
		await resolver(valid, undefined, { fields: {}, shouldUseNativeValidation: false }),
	).toEqual({ errors: {}, values: valid });
	await expect(
		createEditProfileSchema(messages, null).validate({ ...valid, description: undefined }),
	).rejects.toThrow();
});

it('composes initial selection validation without changing other tabs', async () => {
	const schema = createEditProfileSchema(messages, null, 0);
	expect(await schema.isValid({ ...valid, specializationId: 0 })).toBe(false);
	expect(await schema.validate({ ...valid, specializationId: 7 })).toEqual({
		...valid,
		specializationId: 7,
	});
	const resolver = yupResolver(schema);
	const result = await resolver({ ...valid, specializationId: 7 }, undefined, {
		fields: {},
		shouldUseNativeValidation: false,
	});
	expect(result.errors).toEqual({});
	expect(result.values).toEqual({ ...valid, specializationId: 7 });
});
it('locks the established specialization in the composed schema', async () => {
	const schema = createEditProfileSchema(messages, null, 7);
	expect(await schema.isValid({ ...valid, specializationId: 7 })).toBe(true);
	expect(await schema.isValid({ ...valid, specializationId: 8 })).toBe(false);
});
