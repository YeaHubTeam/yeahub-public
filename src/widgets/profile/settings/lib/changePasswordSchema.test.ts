import { createChangePasswordSchema } from './changePasswordSchema';

const schema = createChangePasswordSchema({
	required: 'required',
	min: 'min',
	max: 'max',
	weak: 'weak',
	similar: 'similar',
});
const valid = 'Aa1!aaaa';
it.each([8, 255])('accepts %s-character complex passwords', async (length) => {
	const password = 'Aa1!' + 'a'.repeat(length - 4);
	expect(await schema.validate({ password, passwordConfirm: password })).toEqual({
		password,
		passwordConfirm: password,
	});
});
it.each([7, 256])('rejects the %s-character boundary', async (length) => {
	const password = 'Aa1!' + 'a'.repeat(length - 4);
	await expect(schema.validate({ password, passwordConfirm: password })).rejects.toThrow(
		length === 7 ? 'min' : 'max',
	);
});
it.each(['password', 'passwordConfirm'] as const)('requires %s', async (field) => {
	await expect(
		schema.validate(
			{ password: valid, passwordConfirm: valid, [field]: '' },
			{ abortEarly: false },
		),
	).rejects.toMatchObject({ errors: expect.arrayContaining(['required']) });
});
it.each([
	'abcdefgh',
	'ABCDEFGH',
	'12345678',
	'Aa123456',
	'aa1!aaaa',
	'AA1!AAAA',
	'Aa!aaaaa',
	' Aa1!aaaa',
	'Aa1!aaaa ',
	'Аа1!аааа',
])('enforces existing complexity without trimming %#', async (password) => {
	await expect(schema.validate({ password, passwordConfirm: password })).rejects.toThrow('weak');
});
it('rejects mismatched confirmation', async () => {
	await expect(schema.validate({ password: valid, passwordConfirm: 'Bb2!bbbb' })).rejects.toThrow(
		'similar',
	);
});
it.each([null, 42, [], {}])('does not coerce invalid field types %#', async (password) => {
	await expect(schema.validate({ password, passwordConfirm: valid })).rejects.toThrow();
});
