import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import authMessages from 'public/locales/ru/auth.json';
import { renderToString } from 'react-dom/server.node';
import { FormProvider, useForm } from 'react-hook-form';

import type { LoginFormValues } from '@/entities/auth';
import { useRouter } from '@/shared/config/navigation';

import { LoginForm } from './LoginForm';

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => {
		let value: unknown = jest.requireActual('public/locales/ru/auth.json');
		for (const part of key.split('.')) {
			if (typeof value !== 'object' || value === null || !(part in value))
				throw new Error('Missing test translation');
			value = Reflect.get(value, part);
		}
		if (typeof value !== 'string') throw new Error('Expected translation');
		return value;
	},
}));
jest.mock('next-auth/react', () => ({ signIn: jest.fn() }));
jest.mock('@/shared/config/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('@/shared/config', () => ({
	Auth: {
		FORM_EMAIL_LABEL: 'form.email.label',
		FORM_EMAIL_PLACEHOLDER: 'form.email.placeholder',
		FORM_PASSWORD_LABEL: 'form.password.label',
		FORM_PASSWORD_PLACEHOLDER: 'form.password.placeholder',
		LOGIN_SUBMIT: 'login.submit',
		LOGIN_FORGOT_PASSWORD_LINK: 'login.forgot.password.link',
	},
	ROUTES: { appRoute: '/', auth: { 'forgot-password': { page: '/auth/forgot-password' } } },
	i18Namespace: { auth: 'auth', translation: 'translation' },
}));
jest.mock('@/shared/ui/Icon', () => ({ Icon: () => null }));

let storageWrite: jest.SpyInstance;
let storageRead: jest.SpyInstance;
const originalFetch = globalThis.fetch;
const mockFetch = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
afterAll(() => {
	globalThis.fetch = originalFetch;
});

const replace = jest.fn();
const refresh = jest.fn();
const push = jest.fn();
const credentialsMessage = authMessages.login.error.credentials;
const temporaryMessage = authMessages.login.error.temporary;
const unexpectedMessage = authMessages.login.error.unexpected;
const success = {
	ok: true,
	status: 200,
	error: undefined,
	code: undefined,
	url: 'https://untrusted.example/ignored',
};
const failure = {
	ok: false,
	status: 401,
	error: 'CredentialsSignin',
	code: 'synthetic-internal-code',
	url: null,
};

const Harness = () => {
	const methods = useForm<LoginFormValues>({ defaultValues: { username: '', password: '' } });
	return (
		<FormProvider {...methods}>
			<LoginForm />
		</FormProvider>
	);
};
const fill = (password = ' synthetic Password1! ') => {
	fireEvent.change(screen.getByPlaceholderText(authMessages.form.email.placeholder), {
		target: { value: 'sample@example.com' },
	});
	fireEvent.change(screen.getByPlaceholderText(authMessages.form.password.placeholder), {
		target: { value: password },
	});
};
const submit = () => {
	const button = screen.getByRole('button', { name: authMessages.login.submit });
	const form = button.closest('form');
	if (!form) throw new Error('Expected form');
	fireEvent.submit(form);
	return button;
};

beforeEach(() => {
	window.history.replaceState({}, '', '/ru/auth/login');
	replace.mockReset();
	refresh.mockReset();
	push.mockReset();
	jest.mocked(signIn).mockReset();
	const mockedRouter = jest.mocked(useRouter);
	mockedRouter.mockReturnValue({
		replace,
		refresh,
		push,
		back: jest.fn(),
		forward: jest.fn(),
		prefetch: jest.fn(),
	});
	storageWrite = jest.spyOn(Storage.prototype, 'setItem');
	storageRead = jest.spyOn(Storage.prototype, 'getItem');
	mockFetch.mockReset().mockRejectedValue(new Error('Real HTTP forbidden'));
	globalThis.fetch = mockFetch;
});
afterEach(() => {
	expect(window.location.search).toBe('');
	expect(storageWrite).not.toHaveBeenCalled();
	expect(storageRead).not.toHaveBeenCalled();
	expect(globalThis.fetch).not.toHaveBeenCalled();
	jest.restoreAllMocks();
});

describe('LoginForm Auth.js Credentials submit', () => {
	it('keeps text unchanged during input and trims only edge whitespace on blur', async () => {
		render(<Harness />);
		const email = screen.getByPlaceholderText(authMessages.form.email.placeholder);
		fireEvent.change(email, { target: { value: '  sample name@example.com  ' } });
		expect(email).toHaveValue('  sample name@example.com  ');
		fireEvent.blur(email);
		await waitFor(() => expect(email).toHaveValue('sample name@example.com'));
		expect(signIn).not.toHaveBeenCalled();
	});

	it('normalizes email at submit even without blur and leaves the password untouched', async () => {
		jest.mocked(signIn).mockResolvedValue(failure);
		render(<Harness />);
		fill('  synthetic Password1!  ');
		fireEvent.change(screen.getByPlaceholderText(authMessages.form.email.placeholder), {
			target: { value: '  sample@example.com  ' },
		});
		submit();
		await screen.findByText(credentialsMessage);
		expect(signIn).toHaveBeenCalledWith('credentials', {
			username: 'sample@example.com',
			password: '  synthetic Password1!  ',
			redirect: false,
		});
		expect(screen.getByPlaceholderText(authMessages.form.password.placeholder)).toHaveValue(
			'  synthetic Password1!  ',
		);
	});

	it('does not trim password on blur and displays empty text after trimming whitespace-only login', async () => {
		render(<Harness />);
		fill('  synthetic Password1!  ');
		const password = screen.getByPlaceholderText(authMessages.form.password.placeholder);
		fireEvent.blur(password);
		expect(password).toHaveValue('  synthetic Password1!  ');
		const email = screen.getByPlaceholderText(authMessages.form.email.placeholder);
		fireEvent.change(email, { target: { value: '   ' } });
		fireEvent.blur(email);
		await waitFor(() => expect(email).toHaveValue(''));
	});

	it('cancels native submission when clicking the submit button', async () => {
		jest.mocked(signIn).mockResolvedValue(failure);
		const user = userEvent.setup();
		render(<Harness />);
		fill('synthetic-password');
		const button = screen.getByRole('button', { name: authMessages.login.submit });
		const form = button.closest('form');
		if (!form) throw new Error('Expected form');
		const events: Event[] = [];
		const observe = (event: Event) => events.push(event);
		document.addEventListener('submit', observe);
		try {
			await user.click(button);
			await screen.findByText(credentialsMessage);
			expect(form.method).toBe('post');
			expect(events).toHaveLength(1);
			expect(events[0].defaultPrevented).toBe(true);
			expect(signIn).toHaveBeenCalledTimes(1);
			expect(window.location.search).toBe('');
		} finally {
			document.removeEventListener('submit', observe);
		}
	});

	it('uses the same prevented Auth.js submit when pressing Enter in password', async () => {
		jest.mocked(signIn).mockResolvedValue(failure);
		const user = userEvent.setup();
		render(<Harness />);
		fill('synthetic-password');
		const password = screen.getByPlaceholderText(authMessages.form.password.placeholder);
		const events: Event[] = [];
		const observe = (event: Event) => events.push(event);
		document.addEventListener('submit', observe);
		try {
			password.focus();
			await user.keyboard('{Enter}');
			await screen.findByText(credentialsMessage);
			expect(signIn).toHaveBeenCalledWith('credentials', {
				username: 'sample@example.com',
				password: 'synthetic-password',
				redirect: false,
			});
			expect(events).toHaveLength(1);
			expect(events[0].defaultPrevented).toBe(true);
			expect(window.location.search).toBe('');
		} finally {
			document.removeEventListener('submit', observe);
		}
	});

	it('renders a POST form with disabled submit before hydration or without JavaScript', () => {
		const container = document.createElement('div');
		container.innerHTML = renderToString(<Harness />);
		const forms = container.querySelectorAll('form');
		expect(forms).toHaveLength(1);
		const form = forms[0];
		expect(form.getAttribute('method')).toBe('post');
		expect(form.method).toBe('post');
		expect(form).not.toHaveAttribute('action');
		const button = form.querySelector('button[type="submit"]');
		expect(button).toBeDisabled();
		const username = form.querySelector<HTMLInputElement>('input[name="username"]');
		const password = form.querySelector<HTMLInputElement>('input[name="password"]');
		if (!username || !password) throw new Error('Expected credential fields');
		username.value = 'sample@example.com';
		password.value = 'synthetic-password';
		expect(form.method).not.toBe('get');
		expect(form.querySelector('[formmethod="get"]')).toBeNull();
		expect(signIn).not.toHaveBeenCalled();
		expect(window.location.search).toBe('');
	});

	it('enables submit only after hydration while retaining POST fallback', async () => {
		const container = document.createElement('div');
		container.innerHTML = renderToString(<Harness />);
		document.body.appendChild(container);
		const button = container.querySelector('button[type="submit"]');
		expect(button).toBeDisabled();
		const view = render(<Harness />, { container, hydrate: true });
		await waitFor(() => expect(button).toBeEnabled());
		expect(container.querySelector('form')).toHaveAttribute('method', 'post');
		expect(signIn).not.toHaveBeenCalled();
		view.unmount();
		container.remove();
	});

	it('prevents native submission before an Auth.js rejection settles', async () => {
		jest.mocked(signIn).mockRejectedValue(new TypeError('Synthetic network failure'));
		render(<Harness />);
		fill('synthetic-password');
		const form = screen.getByRole('button', { name: authMessages.login.submit }).closest('form');
		if (!form) throw new Error('Expected form');
		const event = new Event('submit', { bubbles: true, cancelable: true });
		fireEvent(form, event);
		expect(event.defaultPrevented).toBe(true);
		expect(await screen.findByText(temporaryMessage)).toBeInTheDocument();
		expect(window.location.search).toBe('');
		expect(replace).not.toHaveBeenCalled();
	});

	it('passes email as username and preserves password, clears password and uses locale router', async () => {
		jest.mocked(signIn).mockResolvedValue(success);
		render(<Harness />);
		fill();
		submit();
		await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
		expect(signIn).toHaveBeenCalledWith('credentials', {
			username: 'sample@example.com',
			password: ' synthetic Password1! ',
			redirect: false,
		});
		expect(refresh).toHaveBeenCalledTimes(1);
		expect(screen.getByPlaceholderText(authMessages.form.password.placeholder)).toHaveValue('');
		expect(screen.getByPlaceholderText(authMessages.form.email.placeholder)).toHaveValue(
			'sample@example.com',
		);
	});
	it('shows safe credential error and retains fields for retry', async () => {
		jest.mocked(signIn).mockResolvedValue(failure);
		render(<Harness />);
		fill();
		submit();
		expect(await screen.findByText(credentialsMessage)).toBeInTheDocument();
		expect(screen.queryByText('synthetic-internal-code')).not.toBeInTheDocument();
		expect(replace).not.toHaveBeenCalled();
		expect(refresh).not.toHaveBeenCalled();
		expect(screen.getByPlaceholderText(authMessages.form.email.placeholder)).toHaveValue(
			'sample@example.com',
		);
	});
	it.each(['Configuration', 'CallbackRouteError'])(
		'shows a safe temporary error for %s',
		async (error) => {
			jest.mocked(signIn).mockResolvedValue({ ...failure, error });
			render(<Harness />);
			fill();
			submit();
			expect(await screen.findByText(temporaryMessage)).toBeInTheDocument();
			expect(replace).not.toHaveBeenCalled();
		},
	);
	it('handles a server failure without exposing response codes', async () => {
		jest
			.mocked(signIn)
			.mockResolvedValue({ ...failure, status: 500, error: 'SensitiveInternalError' });
		render(<Harness />);
		fill();
		submit();
		expect(await screen.findByText(temporaryMessage)).toBeInTheDocument();
		expect(replace).not.toHaveBeenCalled();
	});
	it('handles network rejection without exposing its message', async () => {
		jest.mocked(signIn).mockRejectedValue(new TypeError('synthetic-token in network detail'));
		render(<Harness />);
		fill();
		submit();
		expect(await screen.findByText(temporaryMessage)).toBeInTheDocument();
		expect(screen.queryByText(/synthetic-token/)).not.toBeInTheDocument();
		expect(replace).not.toHaveBeenCalled();
	});
	it('handles unexpected rejection safely', async () => {
		jest.mocked(signIn).mockRejectedValue(new Error('synthetic-stack-and-token'));
		render(<Harness />);
		fill();
		submit();
		expect(await screen.findByText(unexpectedMessage)).toBeInTheDocument();
		expect(replace).not.toHaveBeenCalled();
	});
	it('does not treat an Auth.js error with ok=true as success', async () => {
		jest.mocked(signIn).mockResolvedValue({ ...failure, ok: true, status: 200 });
		render(<Harness />);
		fill();
		submit();
		expect(await screen.findByText(credentialsMessage)).toBeInTheDocument();
		expect(replace).not.toHaveBeenCalled();
	});
	it('shows unexpected error for unrecognized Auth.js failure', async () => {
		jest.mocked(signIn).mockResolvedValue({ ...failure, error: 'UnknownError', status: 400 });
		render(<Harness />);
		fill();
		submit();
		expect(await screen.findByText(unexpectedMessage)).toBeInTheDocument();
		expect(replace).not.toHaveBeenCalled();
	});
	it('blocks duplicate submits, resets pending on error and permits retry', async () => {
		let complete: (value: typeof failure) => void = () => {
			throw new Error('Pending promise not initialized');
		};
		jest.mocked(signIn).mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					complete = resolve;
				}),
		);
		render(<Harness />);
		fill();
		const button = submit();
		submit();
		await waitFor(() => expect(signIn).toHaveBeenCalledTimes(1));
		expect(button).toBeDisabled();
		submit();
		expect(signIn).toHaveBeenCalledTimes(1);
		await act(async () => {
			complete(failure);
			await Promise.resolve();
		});
		await waitFor(() => expect(button).toBeEnabled());
		jest.mocked(signIn).mockResolvedValue(success);
		submit();
		await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
		expect(signIn).toHaveBeenCalledTimes(2);
	});
	it('preserves the forgot-password navigation', () => {
		render(<Harness />);
		fireEvent.click(screen.getByText(authMessages.login.forgot.password.link));
		expect(push).toHaveBeenCalledWith('/auth/forgot-password');
		expect(signIn).not.toHaveBeenCalled();
	});
});
