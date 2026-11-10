import { yupResolver } from '@hookform/resolvers/yup';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import authMessages from 'public/locales/ru/auth.json';
import { FormProvider, useForm } from 'react-hook-form';

import { RegisterForm } from '@/features/authentication/registration';

import { createRegisterSchema } from '../lib/validation/registerSchema';
import type { UserSchema } from '../model/types/userTypes';

jest.mock('next-intl', () => ({
	useTranslations: () => {
		const translate = (key: string) => {
			let value: unknown = jest.requireActual('public/locales/ru/auth.json');
			for (const part of key.split('.')) {
				if (typeof value !== 'object' || value === null || !(part in value)) return key;
				value = Reflect.get(value, part);
			}
			return typeof value === 'string' ? value : key;
		};
		return Object.assign(translate, { rich: (key: string) => key });
	},
}));
jest.mock('@/shared/config', () => ({
	...jest.requireActual<object>('@/shared/config/i18n/i18nTranslations'),
	i18Namespace: { auth: 'auth', translation: 'translation' },
}));
jest.mock('@/shared/config/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@/shared/ui/Icon', () => ({ Icon: () => null }));

const messages = {
	required: 'Required',
	email: 'Invalid email',
	minUsernameLength: 'Min username',
	maxUsernameLength: 'Max username',
	minPasswordLength: 'Min password',
	passwordWeak: 'Weak password',
	passwordSimilar: 'Passwords differ',
	privacy: 'Consent required',
};
const schema = createRegisterSchema(messages);
const values = {
	username: 'sample',
	email: 'sample@example.com',
	password: 'Abcdef1!',
	passwordConfirmation: 'Abcdef1!',
	privacyConsent: true,
	offerConsent: true,
};
const Harness = () => {
	const methods = useForm<UserSchema>({
		resolver: yupResolver(schema),
		mode: 'onTouched',
		defaultValues: {
			username: '',
			email: '',
			password: '',
			passwordConfirmation: '',
			privacyConsent: false,
			offerConsent: false,
		},
	});
	return (
		<FormProvider {...methods}>
			<RegisterForm />
		</FormProvider>
	);
};
const input = (name: string) => {
	const field = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
	if (!field) throw new Error('Missing test field');
	return field;
};
const enter = (name: string, value: string) => fireEvent.change(input(name), { target: { value } });
const blur = async (name: string) => {
	await act(async () => {
		fireEvent.blur(input(name));
		await Promise.resolve();
	});
};
const toggle = async (name: string) => {
	await act(async () => {
		fireEvent.click(input(name));
		await Promise.resolve();
	});
};
const originalFetch = globalThis.fetch;
const mockFetch = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
beforeEach(() => {
	mockFetch.mockReset().mockRejectedValue(new Error('Real requests forbidden'));
	globalThis.fetch = mockFetch;
});
afterEach(() => {
	expect(mockFetch).not.toHaveBeenCalled();
});
afterAll(() => {
	globalThis.fetch = originalFetch;
});

describe('registration normalization schema', () => {
	it('trims both text fields before validation', async () => {
		await expect(
			schema.validate({ ...values, username: '  sample  ', email: '  sample@example.com\t ' }),
		).resolves.toEqual(values);
	});
	it('preserves internal nickname spaces under the original rules', async () => {
		expect((await schema.validate({ ...values, username: '  sample name  ' })).username).toBe(
			'sample name',
		);
	});
	it('rejects internal email whitespace rather than repairing it', async () => {
		const data = { ...values, email: '  sample name@example.com  ' };
		expect(schema.cast(data).email).toBe('sample name@example.com');
		await expect(schema.validate(data)).rejects.toMatchObject({
			path: 'email',
			message: 'Invalid email',
		});
	});
	it.each(['email', 'username'])('rejects whitespace-only %s', async (name) => {
		try {
			await schema.validate({ ...values, [name]: '   ' }, { abortEarly: false });
			throw new Error('Expected validation failure');
		} catch (error) {
			expect(error).toMatchObject({ errors: expect.arrayContaining(['Required']) });
		}
	});
	it('does not normalize password or confirmation before validation', async () => {
		const data = { ...values, password: ' Abcdef1! ', passwordConfirmation: ' Abcdef1! ' };
		expect(schema.cast(data)).toEqual(data);
		await expect(schema.validate(data)).rejects.toMatchObject({
			errors: expect.arrayContaining(['Weak password']),
		});
	});
	it('retains password confirmation matching', async () => {
		await expect(
			schema.validate({ ...values, passwordConfirmation: 'Abcdef2!' }),
		).rejects.toMatchObject({ path: 'passwordConfirmation', message: 'Passwords differ' });
	});
	it.each(['privacyConsent', 'offerConsent'])('retains mandatory %s', async (name) => {
		await expect(schema.validate({ ...values, [name]: false })).rejects.toMatchObject({
			path: name,
			message: 'Consent required',
		});
	});
	it('keeps advertising consent optional and preserves its boolean value', async () => {
		for (const adConsent of [false, true])
			expect(await schema.validate({ ...values, adConsent })).toMatchObject({ adConsent });
		await expect(schema.validate(values)).resolves.toEqual(values);
	});
});

describe('RegisterForm text field behavior', () => {
	it('normalizes through the real resolver when submitting without blur', async () => {
		const validate = jest.spyOn(schema, 'validate');
		try {
			render(<Harness />);
			enter('username', '  sample  ');
			enter('email', '  sample@example.com  ');
			enter('password', 'Abcdef1!');
			enter('passwordConfirmation', 'Abcdef1!');
			await toggle('privacyConsent');
			await toggle('offerConsent');
			validate.mockClear();
			const form = input('email').closest('form');
			if (!form) throw new Error('Expected form');
			await act(async () => {
				fireEvent.submit(form);
				await Promise.resolve();
			});
			expect(validate).toHaveBeenCalled();
			await expect(validate.mock.results[0].value).resolves.toMatchObject(values);
		} finally {
			validate.mockRestore();
		}
	});

	it.each(['email', 'username'])(
		'keeps %s untouched during input and trims on blur',
		async (name) => {
			render(<Harness />);
			enter(name, '  sample value  ');
			expect(input(name)).toHaveValue('  sample value  ');
			await blur(name);
			await waitFor(() => expect(input(name)).toHaveValue('sample value'));
		},
	);
	it('shows existing validation for empty email after trim', async () => {
		render(<Harness />);
		enter('email', '   ');
		await blur('email');
		await waitFor(() => expect(input('email')).toHaveValue(''));
		await waitFor(() =>
			expect(screen.getByRole('button', { name: authMessages.registration.submit })).toBeDisabled(),
		);
	});
	it('does not trim password or confirmation on blur', async () => {
		render(<Harness />);
		for (const name of ['password', 'passwordConfirmation']) {
			enter(name, ' Abcdef1! ');
			await blur(name);
		}
		await screen.findAllByText('Weak password');
		expect(input('password')).toHaveValue(' Abcdef1! ');
		expect(input('passwordConfirmation')).toHaveValue(' Abcdef1! ');
	});
	it('keeps checkbox behavior and permits UI-only submit after text normalization', async () => {
		render(<Harness />);
		for (const [name, value] of Object.entries({
			username: '  sample  ',
			email: '  sample@example.com  ',
			password: 'Abcdef1!',
			passwordConfirmation: 'Abcdef1!',
		})) {
			enter(name, value);
			await blur(name);
		}
		const checkboxes = screen.getAllByRole('checkbox');
		expect(checkboxes).toHaveLength(3);
		await toggle('privacyConsent');
		await blur('privacyConsent');
		await toggle('offerConsent');
		await blur('offerConsent');
		const button = screen.getByRole('button', { name: authMessages.registration.submit });
		await waitFor(() => expect(button).toBeEnabled());
		expect(input('adConsent')).not.toBeChecked();
		await toggle('adConsent');
		expect(input('adConsent')).toBeChecked();
		await toggle('adConsent');
		expect(input('adConsent')).not.toBeChecked();
		await toggle('privacyConsent');
		await waitFor(() => expect(button).toBeDisabled());
		await toggle('privacyConsent');
		await waitFor(() => expect(button).toBeEnabled());
		expect(input('username')).toHaveValue('sample');
		expect(input('email')).toHaveValue('sample@example.com');
		const form = button.closest('form');
		if (!form) throw new Error();
		const event = new Event('submit', { bubbles: true, cancelable: true });
		await act(async () => {
			fireEvent(form, event);
			await Promise.resolve();
		});
		expect(event.defaultPrevented).toBe(true);
	});
});
