/** @jest-environment node */
import { yupResolver } from '@hookform/resolvers/yup';
import { createTranslator } from 'next-intl';
import profileMessages from 'public/locales/ru/profile.json';
import messages from 'public/locales/ru/translation.json';
import * as yup from 'yup';

import type { OwnProfile } from '@/entities/profile';
import { createPersonalDefaults, toPersonalPayload } from '@/features/profile/editPersonal';
import type { PersonalFormValues } from '@/features/profile/editPersonal';

import { createPersonalSchema } from './personalSchema';

const t = createTranslator({ locale: 'ru', messages });
const profileT = createTranslator({ locale: 'ru', messages: profileMessages });
const schema = createPersonalSchema({
	required: t('validation.required'),
	minUsernameLength: t('validation.length.min', { count: 2 }),
	maxUsernameLength: t('validation.length.max', { count: 30 }),
	socialNetwork: profileT('edit.validation.socialNetwork'),
});
const value: PersonalFormValues = {
	username: ' Name ',
	city: '',
	socialNetwork: [{ code: 'github', title: 'not a URL' }],
};
it.each([2, 30])('accepts username length %s', async (length) => {
	await expect(schema.validate({ ...value, username: 'a'.repeat(length) })).resolves.toMatchObject({
		username: 'a'.repeat(length),
	});
});
it.each([
	['', 'validation.required', 0],
	['a', 'validation.length.min', 2],
	['a'.repeat(31), 'validation.length.max', 30],
])('rejects username case %# with localized errors', async (username, key, count) => {
	await expect(schema.validate({ ...value, username })).rejects.toMatchObject({
		path: 'username',
		message: t(key as 'validation.required', { count }),
	});
});
it('does not trim username, city or social values and allows empty city', async () => {
	const result: yup.InferType<typeof schema> = await schema.validate(value);
	const compatible: PersonalFormValues = result;
	expect(compatible).toEqual(value);
	expect(Object.keys(schema.fields)).toEqual([
		'specializationId',
		'username',
		'city',
		'socialNetwork',
	]);
	await expect(schema.validate({ ...value, city: ' City ' })).resolves.toMatchObject({
		city: ' City ',
	});
});
it.each([null, 1, {}, []])('rejects non-string username (%#)', async (username) => {
	await expect(schema.validate({ ...value, username })).rejects.toBeInstanceOf(yup.ValidationError);
});
it.each(
	[
		[{ code: 'unknown', title: 'x' }],
		[{ code: 'github', title: 1 }],
		[{ code: 'github', title: 'x', extra: 'x' }],
		[
			{ code: 'github', title: 'x' },
			{ code: 'github', title: '' },
		],
	].map((entry) => [entry]),
)('rejects invalid social records (%#)', async (socialNetwork) => {
	await expect(schema.validate({ ...value, socialNetwork })).rejects.toBeInstanceOf(
		yup.ValidationError,
	);
});
it('allows no social links, empty entries and non-URL strings without extra rules', async () => {
	await expect(schema.validate({ ...value, socialNetwork: [] })).resolves.toMatchObject({
		socialNetwork: [],
	});
	await expect(
		schema.validate({ ...value, socialNetwork: [{ code: 'github', title: '' }] }),
	).resolves.toMatchObject({ socialNetwork: [{ code: 'github', title: '' }] });
});
it('defaults exclude unknown records, avoid duplicate codes and preserve empty strings', () => {
	const profile = {
		username: ' Name ',
		city: null,
		activeProfile: {
			socialNetwork: [
				{ code: 'legacy', title: 'server' },
				{ code: 'github', title: '' },
				{ code: 'github', title: 'duplicate' },
			],
		},
	} as OwnProfile;
	const defaults = createPersonalDefaults(profile);
	expect(defaults.city).toBe('');
	expect(defaults.username).toBe(' Name ');
	expect(defaults.socialNetwork).toHaveLength(9);
	expect(new Set(defaults.socialNetwork.map((link) => link.code)).size).toBe(9);
	expect(defaults.socialNetwork.every((link) => link.title === '')).toBe(true);
	expect(toPersonalPayload(defaults)).toEqual({ username: ' Name ', city: '', socialNetwork: [] });
});
it('composes with the future fields and works with yupResolver without changing other tabs', async () => {
	const combined = schema.concat(
		yup.object({
			description: yup.string().defined(),
			profileSkills: yup.array(yup.number().defined()).defined(),
		}),
	);
	const data = { ...value, description: '<p>Other tab</p>', profileSkills: [1, 2] };
	const resolved = await yupResolver(combined)(data, undefined, {
		criteriaMode: 'all',
		fields: {},
		shouldUseNativeValidation: false,
	});
	expect(resolved.errors).toEqual({});
	expect(resolved.values).toEqual(data);
});

describe('specialization selection', () => {
	const messages = {
		required: 'Required',
		minUsernameLength: 'Min',
		maxUsernameLength: 'Max',
		socialNetwork: 'Social',
	};
	it.each([1, 42])('accepts initial positive ID %s without coercion', async (specializationId) => {
		expect(
			await createPersonalSchema(messages, 0).validate({ ...value, specializationId }),
		).toEqual({ ...value, specializationId });
	});
	it.each([
		undefined,
		null,
		0,
		-1,
		1.5,
		'1',
		'',
		NaN,
		Infinity,
		{},
		[],
		Number.MAX_SAFE_INTEGER + 1,
	])('rejects invalid initial ID %j', async (specializationId) => {
		expect(await createPersonalSchema(messages, 0).isValid({ ...value, specializationId })).toBe(
			false,
		);
	});
	it('requires selection and preserves established specialization', async () => {
		expect(await createPersonalSchema(messages, 0).isValid(value)).toBe(false);
		expect(await createPersonalSchema(messages, 3).isValid({ ...value, specializationId: 3 })).toBe(
			true,
		);
		expect(await createPersonalSchema(messages, 3).isValid({ ...value, specializationId: 4 })).toBe(
			false,
		);
		expect(await createPersonalSchema(messages, 3).isValid(value)).toBe(false);
	});
});
