import { yupResolver } from '@hookform/resolvers/yup';
import { createTranslator } from 'next-intl';
import messages from 'public/locales/ru/translation.json';

import type { SignUpFormValues } from '@/entities/auth';

import type { UserSchema } from '../../model/types/userTypes';
import { createRegisterSchema } from './registerSchema';

const t = createTranslator({ locale: 'ru', messages });
const localized = {
	required: t('validation.required'),
	email: t('validation.email'),
	minUsernameLength: t('validation.length.min', { count: 2 }),
	maxUsernameLength: t('validation.length.max', { count: 30 }),
	minPasswordLength: t('validation.length.min', { count: 8 }),
	maxPasswordLength: t('validation.length.max', { count: 255 }),
	passwordWeak: t('validation.password.weak'),
	passwordSimilar: t('validation.password.similar'),
	privacy: t('validation.privacy'),
};
const schema = createRegisterSchema(localized);
const valid = {
	username: 'user',
	email: 'test@example.invalid',
	password: 'Synthetic1!',
	passwordConfirmation: 'Synthetic1!',
	privacyConsent: true,
	offerConsent: true,
};
it('accepts valid data without isChecked or adConsent and aligns form types', async () => {
	const result: UserSchema = await schema.validate(valid);
	const form: SignUpFormValues = result;
	expect(form).toEqual(valid);
	expect(schema.fields).not.toHaveProperty('isChecked');
});
it.each([
	[1, false],
	[2, true],
	[30, true],
	[31, false],
])('checks username length %i', async (length, expected) => {
	expect(await schema.isValid({ ...valid, username: 'a'.repeat(Number(length)) })).toBe(expected);
});
it.each([
	[7, false],
	[8, true],
	[255, true],
	[256, false],
])('checks password length %i', async (length, expected) => {
	const password = `Aa1!${'a'.repeat(Number(length) - 4)}`;
	expect(await schema.isValid({ ...valid, password, passwordConfirmation: password })).toBe(
		expected,
	);
});
it('uses localized maximum length error', async () => {
	const password = `Aa1!${'a'.repeat(252)}`;
	await expect(
		schema.validate({ ...valid, password, passwordConfirmation: password }, { abortEarly: false }),
	).rejects.toMatchObject({ errors: expect.arrayContaining([localized.maxPasswordLength]) });
});
it('preserves the existing factory call without a maximum message', async () => {
	const { maxPasswordLength: _max, ...legacy } = localized;
	expect(await createRegisterSchema(legacy).isValid(valid)).toBe(true);
});
it('rejects invalid email and mismatched confirmation', async () => {
	await expect(schema.validate({ ...valid, email: 'invalid' })).rejects.toMatchObject({
		message: localized.email,
	});
	await expect(
		schema.validate({ ...valid, passwordConfirmation: 'Different1!' }),
	).rejects.toMatchObject({ message: localized.passwordSimilar });
});
it.each([
	'username',
	'email',
	'password',
	'passwordConfirmation',
	'privacyConsent',
	'offerConsent',
])('requires %s', async (key) => {
	const data: Record<string, unknown> = { ...valid };
	delete data[key];
	expect(await schema.isValid(data)).toBe(false);
});
it.each([false, 'true', 1])('requires strictly true mandatory consents: case %#', async (value) => {
	expect(await schema.isValid({ ...valid, privacyConsent: value })).toBe(false);
	expect(await schema.isValid({ ...valid, offerConsent: value })).toBe(false);
});
it.each([undefined, false, true])('accepts optional adConsent case %#', async (adConsent) => {
	expect(await schema.isValid({ ...valid, adConsent })).toBe(true);
});
it.each(['false', 0, null])('rejects non-boolean adConsent case %#', async (adConsent) => {
	expect(await schema.isValid({ ...valid, adConsent })).toBe(false);
});
it('trims username/email only', async () => {
	await expect(
		schema.validate({ ...valid, username: ' user ', email: ' test@example.invalid ' }),
	).resolves.toEqual(valid);
});
it('preserves and rejects password whitespace instead of trimming', async () => {
	const password = ` ${valid.password} `;
	const input = { ...valid, password, passwordConfirmation: password };
	expect(schema.cast(input).password).toBe(password);
	expect(schema.cast(input).passwordConfirmation).toBe(password);
	expect(await schema.isValid(input)).toBe(false);
});
it.each(['lowercase1!', 'UPPERCASE1!', 'NoDigits!!', 'NoSymbols1'])(
	'retains complexity requirement: case %#',
	async (password) => {
		expect(await schema.isValid({ ...valid, password, passwordConfirmation: password })).toBe(
			false,
		);
	},
);
it('works with yupResolver', async () => {
	await expect(
		yupResolver(schema)(valid, undefined, { fields: {}, shouldUseNativeValidation: false }),
	).resolves.toEqual({ values: valid, errors: {} });
});
