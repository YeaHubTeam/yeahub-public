import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ForgotPassword } from '../index';

jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config/i18n/i18nTranslations'),
	i18Namespace: { auth: 'auth', translation: 'translation' },
}));
jest.mock('next-intl', () => ({
	useTranslations: (namespace: string) => {
		const { createTranslator } = jest.requireActual('next-intl');
		return createTranslator({
			locale: 'ru',
			messages: jest.requireActual(`public/locales/ru/${namespace}.json`),
		});
	},
}));
jest.mock('@/shared/libs', () => ({
	emailRule: jest.requireActual('@/shared/libs/app/regexp').emailRule,
}));
jest.mock('@/shared/ui/Icon', () => ({ Icon: () => null }));
const originalFetch = globalThis.fetch;
const fetchMock = jest.fn();
beforeEach(() => {
	fetchMock.mockReset();
	globalThis.fetch = fetchMock;
});
afterEach(() => {
	expect(fetchMock).not.toHaveBeenCalled();
	globalThis.fetch = originalFetch;
});
const input = () => screen.getByPlaceholderText('Введите электронную почту');
const button = () => screen.getByRole('button', { name: 'Отправить' });
const fill = async (value = 'test@example.invalid') => {
	fireEvent.change(input(), { target: { value } });
	fireEvent.blur(input());
	await waitFor(() => expect(button()).toBeEnabled());
};
it('starts disabled and shows localized label', () => {
	render(<ForgotPassword sendEmailAction={jest.fn()} />);
	expect(button()).toBeDisabled();
	expect(screen.getByText('Электронная почта')).toBeInTheDocument();
});
it.each([
	['invalid', 'Неверный формат электронной почты'],
	['   ', 'Это поле обязательно для заполнения'],
])('shows validation for case %#', async (value, message) => {
	render(<ForgotPassword sendEmailAction={jest.fn()} />);
	fireEvent.change(input(), { target: { value } });
	fireEvent.blur(input());
	expect(await screen.findByText(message)).toBeInTheDocument();
	expect(button()).toBeDisabled();
});
it('trims on blur and submits normalized email', async () => {
	const submit = jest.fn().mockResolvedValue({ status: 'success' });
	render(<ForgotPassword sendEmailAction={submit} />);
	await fill(' test@example.invalid ');
	expect(input()).toHaveValue('test@example.invalid');
	fireEvent.click(button());
	await waitFor(() => expect(submit).toHaveBeenCalledWith('test@example.invalid'));
});
it('blocks repeated submissions while pending', async () => {
	let finish: ((value: { status: 'success' }) => void) | undefined;
	const submit = jest.fn(
		() =>
			new Promise<{ status: 'success' }>((resolve) => {
				finish = resolve;
			}),
	);
	render(<ForgotPassword sendEmailAction={submit} />);
	await fill();
	const form = button().closest('form')!;
	fireEvent.submit(form);
	fireEvent.submit(form);
	await waitFor(() => expect(button()).toHaveAttribute('aria-busy', 'true'));
	expect(button()).toBeDisabled();
	expect(submit).toHaveBeenCalledTimes(1);
	await act(async () => {
		finish?.({ status: 'success' });
		await Promise.resolve();
	});
	await waitFor(() => expect(button()).toBeEnabled());
});
it('shows parent error', () => {
	render(<ForgotPassword sendEmailAction={jest.fn()} error="Безопасная ошибка" />);
	expect(screen.getByRole('alert')).toHaveTextContent('Безопасная ошибка');
});
it('handles rejection without exposing technical details', async () => {
	render(
		<ForgotPassword sendEmailAction={jest.fn().mockRejectedValue(new Error('private-details'))} />,
	);
	await fill();
	fireEvent.click(button());
	expect(await screen.findByRole('alert')).toHaveTextContent(
		'Не удалось отправить письмо. Попробуйте ещё раз позже.',
	);
	expect(screen.queryByText('private-details')).not.toBeInTheDocument();
	await waitFor(() => expect(button()).toBeEnabled());
});

it('uses the localized 254-character limit from the real schema', async () => {
	render(<ForgotPassword sendEmailAction={jest.fn()} />);
	fireEvent.change(input(), { target: { value: `${'a'.repeat(250)}@example.invalid` } });
	fireEvent.blur(input());
	expect(await screen.findByText('Максимальная длина 254 символа')).toBeInTheDocument();
	expect(button()).toBeDisabled();
});

it.each(['validation-error', 'error'])('does not open modal after %s', async (status) => {
	const action = jest.fn().mockResolvedValue({ status });
	render(<ForgotPassword sendEmailAction={action} />);
	await fill();
	fireEvent.click(button());
	expect(await screen.findByRole('alert')).toHaveTextContent(
		'Не удалось отправить письмо. Попробуйте ещё раз позже.',
	);
	expect(screen.queryByTestId('Modal')).toBeNull();
});
it.each([true, false])(
	'resends the last successful email and restarts only on success: %s',
	async (success) => {
		const action = jest
			.fn()
			.mockResolvedValueOnce({ status: 'success' })
			.mockResolvedValueOnce({ status: success ? 'success' : 'error' });
		render(<ForgotPassword sendEmailAction={action} />);
		await fill(' test@example.invalid ');
		jest.useFakeTimers();
		try {
			await act(async () => {
				fireEvent.click(button());
				await Promise.resolve();
			});
			expect(screen.getByTestId('Modal')).toBeInTheDocument();
			act(() => {
				jest.advanceTimersByTime(60000);
			});
			const resend = screen.getByRole('button', { name: 'Отправить повторно' });
			await act(async () => {
				fireEvent.click(resend);
				await Promise.resolve();
			});
			expect(action.mock.calls).toEqual([['test@example.invalid'], ['test@example.invalid']]);
			expect(screen.getByRole('timer')).toHaveTextContent(success ? '60 секунд' : '0 секунд');
			if (!success) expect(screen.getByRole('alert')).toBeInTheDocument();
		} finally {
			jest.useRealTimers();
		}
	},
);
it('keeps email out of URL and storage', async () => {
	const write = jest.spyOn(Storage.prototype, 'setItem');
	const action = jest.fn().mockResolvedValue({ status: 'success' });
	try {
		render(<ForgotPassword sendEmailAction={action} />);
		await fill();
		fireEvent.click(button());
		expect(await screen.findByTestId('Modal')).toBeInTheDocument();
		expect(window.location.search).toBe('');
		expect(write).not.toHaveBeenCalled();
	} finally {
		write.mockRestore();
	}
});
it('ignores completion after unmount', async () => {
	let finish: ((value: { status: 'success' }) => void) | undefined;
	const action = jest.fn(
		() =>
			new Promise<{ status: 'success' }>((resolve) => {
				finish = resolve;
			}),
	);
	const ui = render(<ForgotPassword sendEmailAction={action} />);
	await fill();
	fireEvent.click(button());
	await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
	ui.unmount();
	await act(async () => {
		finish?.({ status: 'success' });
		await Promise.resolve();
	});
	expect(screen.queryByTestId('Modal')).toBeNull();
});
