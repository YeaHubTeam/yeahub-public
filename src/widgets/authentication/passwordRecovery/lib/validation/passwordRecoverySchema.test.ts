import { yupResolver } from '@hookform/resolvers/yup';
import { createTranslator } from 'next-intl';
import messages from 'public/locales/ru/translation.json';
import type * as yup from 'yup';

import { createPasswordRecoverySchema } from './passwordRecoverySchema';

const t = createTranslator({ locale: 'ru', messages });
const localized = {
	required: t('validation.required'),
	minPasswordLength: t('validation.length.min', { count: 8 }),
	maxPasswordLength: t('validation.length.max', { count: 255 }),
	passwordWeak: t('validation.password.weak'),
	passwordSimilar: t('validation.password.similar'),
};
const schema = createPasswordRecoverySchema(localized);
const valid = 'Synthetic1!';
const pair = (password: string) => ({ password, confirmPassword: password });

it('requires both fields with localized errors', async () => {
	await expect(schema.validate(pair(''), { abortEarly: false })).rejects.toMatchObject({
		inner: expect.arrayContaining([
			expect.objectContaining({ path: 'password', message: localized.required }),
			expect.objectContaining({ path: 'confirmPassword', message: localized.required }),
		]),
	});
	await expect(schema.validate({})).rejects.toMatchObject({ message: localized.required });
});
it('rejects seven characters with the minimum message', async () => {
	await expect(schema.validate(pair('Aa1!aaa'))).rejects.toMatchObject({
		message: localized.minPasswordLength,
	});
});
it.each([8, 255])('accepts exact boundary %i unchanged', async (length) => {
	const input = pair(`Aa1!${'a'.repeat(length - 4)}`);
	await expect(schema.validate(input)).resolves.toEqual(input);
});
it('rejects more than 255 characters with maximum message', async () => {
	await expect(schema.validate(pair(`Aa1!${'a'.repeat(252)}`))).rejects.toMatchObject({
		message: localized.maxPasswordLength,
	});
});
it.each([
	'lowercase1!',
	'UPPERCASE1!',
	'NoDigits!!',
	'NoSymbols1',
	'Аа1!aaaa',
	'Aa1!aaaa🙂',
	'Aa1!aa aa',
])('rejects missing complexity or forbidden characters: case %#', async (password) => {
	await expect(schema.validate(pair(password))).rejects.toMatchObject({
		message: localized.passwordWeak,
	});
});
it('requires exact matching with localized message', async () => {
	await expect(
		schema.validate({ password: valid, confirmPassword: `${valid}x` }),
	).rejects.toMatchObject({ path: 'confirmPassword', message: localized.passwordSimilar });
});
it('returns the exact inferred field structure and case', async () => {
	const result: yup.InferType<typeof schema> = await schema.validate(pair(valid));
	const typed: { password: string; confirmPassword: string } = result;
	expect(typed).toEqual(pair(valid));
	expect(Object.keys(schema.fields)).toEqual(['password', 'confirmPassword']);
});
it.each([` ${valid}`, `${valid} `, ` ${valid} `])(
	'does not trim whitespace: case %#',
	async (password) => {
		expect(schema.cast(pair(password))).toEqual(pair(password));
		await expect(schema.validate(pair(password))).rejects.toMatchObject({
			message: localized.passwordWeak,
		});
	},
);
it.each(['Aa1!aaa', `Aa1!${'a'.repeat(252)}`, 'lowercase1!'])(
	'also rejects invalid confirmation: case %#',
	async (confirmPassword) => {
		expect(await schema.isValid({ password: valid, confirmPassword })).toBe(false);
	},
);
it('rejects non-string values instead of coercing them', async () => {
	expect(await schema.isValid({ password: 12345678, confirmPassword: 12345678 })).toBe(false);
});
it('works with the real yupResolver', async () => {
	const input = pair(valid);
	await expect(
		yupResolver(schema)(input, undefined, { fields: {}, shouldUseNativeValidation: false }),
	).resolves.toEqual({ values: input, errors: {} });
});
