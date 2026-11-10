import { yupResolver } from '@hookform/resolvers/yup';
import { createTranslator } from 'next-intl';
import messages from 'public/locales/ru/translation.json';
import type * as yup from 'yup';

import { createForgotPasswordSchema } from './forgotPasswordSchema';

const t = createTranslator({ locale: 'ru', messages });
const schema = createForgotPasswordSchema({
	email: t('validation.email'),
	required: t('validation.required'),
	maxEmailLength: t('validation.length.max', { count: 254 }),
});
const address = (length: number) =>
	`${'a'.repeat(length - '@example.invalid'.length)}@example.invalid`;

it('returns the expected inferred structure', async () => {
	const result: yup.InferType<typeof schema> = await schema.validate({
		username: 'test@example.invalid',
	});
	const expected: { username: string } = result;
	expect(expected).toEqual({ username: 'test@example.invalid' });
	expect(Object.keys(schema.fields)).toEqual(['username']);
});
it('trims before validating and returns the normalized value', async () => {
	await expect(schema.validate({ username: ' \ttest+tag@example.invalid\n ' })).resolves.toEqual({
		username: 'test+tag@example.invalid',
	});
});
it.each(['', '   ', '\t\n'])(
	'rejects empty values with the required translation: case %#',
	async (username) => {
		await expect(schema.validate({ username })).rejects.toMatchObject({
			path: 'username',
			message: t('validation.required'),
		});
	},
);
it('rejects missing username', async () => {
	await expect(schema.validate({})).rejects.toMatchObject({ message: t('validation.required') });
});
it.each(['invalid', 'test name@example.invalid', 'test@ example.invalid'])(
	'preserves and rejects invalid internal characters: case %#',
	async (username) => {
		expect(schema.cast({ username }).username).toBe(username);
		await expect(schema.validate({ username })).rejects.toMatchObject({
			path: 'username',
			message: t('validation.email'),
		});
	},
);
it.each([253, 254])('accepts length %i', async (length) => {
	await expect(schema.validate({ username: address(length) })).resolves.toEqual({
		username: address(length),
	});
});
it.each([255, 300])('rejects length %i with localized maximum', async (length) => {
	await expect(schema.validate({ username: address(length) })).rejects.toMatchObject({
		path: 'username',
		message: t('validation.length.max', { count: 254 }),
	});
});
it('applies the length limit after trim', async () => {
	await expect(schema.validate({ username: ` ${address(254)} ` })).resolves.toEqual({
		username: address(254),
	});
});
it('works with yupResolver and produces normalized RHF values', async () => {
	const result = await yupResolver(schema)({ username: ' test@example.invalid ' }, undefined, {
		fields: {},
		shouldUseNativeValidation: false,
	});
	expect(result).toEqual({ values: { username: 'test@example.invalid' }, errors: {} });
});
