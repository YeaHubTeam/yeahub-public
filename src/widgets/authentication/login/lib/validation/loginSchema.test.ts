import { createLoginSchema } from './loginSchema';

const schema = createLoginSchema({ email: 'Invalid email', required: 'Required' });

describe('login schema normalization before validation', () => {
	it('accepts email with edge whitespace and returns a trimmed username', async () => {
		await expect(
			schema.validate({
				username: '  sample@example.com\t ',
				password: '  synthetic Password1!  ',
			}),
		).resolves.toEqual({ username: 'sample@example.com', password: '  synthetic Password1!  ' });
	});

	it('preserves internal whitespace instead of silently repairing invalid email', async () => {
		const input = { username: '  sample name@example.com  ', password: 'synthetic' };
		expect(schema.cast(input).username).toBe('sample name@example.com');
		await expect(schema.validate(input)).rejects.toMatchObject({
			path: 'username',
			message: 'Invalid email',
		});
	});

	it('rejects empty username after trim with the existing validators', async () => {
		expect(schema.cast({ username: '   ', password: 'synthetic' }).username).toBe('');
		try {
			await schema.validate({ username: '   ', password: 'synthetic' }, { abortEarly: false });
			throw new Error('Expected validation failure');
		} catch (error) {
			expect(error).toMatchObject({ errors: expect.arrayContaining(['Required']) });
		}
	});

	it('does not change password whitespace during casting or validation', async () => {
		const input = { username: 'sample@example.com', password: '  synthetic password  ' };
		expect(schema.cast(input).password).toBe(input.password);
		expect((await schema.validate(input)).password).toBe(input.password);
	});

	it('retains required password validation', async () => {
		await expect(
			schema.validate({ username: 'sample@example.com', password: '' }),
		).rejects.toMatchObject({ path: 'password', message: 'Required' });
	});
});
