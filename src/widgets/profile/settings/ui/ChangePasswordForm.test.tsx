import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import type { ChangePasswordResult } from '@/entities/auth';

import header from '../../../../../public/locales/ru/header.json';
import profile from '../../../../../public/locales/ru/profile.json';
import translation from '../../../../../public/locales/ru/translation.json';
import { SettingsShell } from '../index';

const replace = jest.fn();
const router = { replace };
const update = jest.fn();
const signOut = jest.fn();
jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config'),
	useRouter: () => router,
}));
jest.mock('next-auth/react', () => ({
	useSession: () => ({ update }),
	signOut: (...args: unknown[]) => signOut(...args),
}));
const action = jest.fn<
	Promise<ChangePasswordResult>,
	[{ password: string; passwordConfirm: string }]
>();
const mount = () =>
	render(
		<NextIntlClientProvider locale="ru" messages={{ profile, header, translation }}>
			<SettingsShell passwordAction={action} />
		</NextIntlClientProvider>,
	);
const input = (name: string) => document.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
const button = () => screen.getByRole('button', { name: 'Сохранить' });
const fill = async (password = 'Aa1!aaaa', confirmation = password) => {
	await act(async () => {
		for (const [name, value] of [
			['password', password],
			['passwordConfirm', confirmation],
		]) {
			fireEvent.change(input(name), { target: { value } });
			fireEvent.blur(input(name));
		}
		await Promise.resolve();
	});
};
const submit = async () => {
	await act(async () => {
		fireEvent.submit(input('password').closest('form')!);
		await Promise.resolve();
	});
};
beforeEach(() => {
	window.history.replaceState(null, '', '/ru/settings#change-password');
	action.mockReset().mockResolvedValue({ status: 'success' });
	replace.mockClear();
	update.mockClear();
	signOut.mockClear();
});
it('renders two hidden password fields in React order with disabled initial submit', () => {
	mount();
	expect(screen.getByText('Сменить пароль')).toBeInTheDocument();
	expect([...document.querySelectorAll('input')].map((field) => field.name)).toEqual([
		'password',
		'passwordConfirm',
	]);
	expect(input('password')).toHaveAttribute('type', 'password');
	expect(input('passwordConfirm')).toHaveAttribute('type', 'password');
	expect(button()).toBeDisabled();
	expect(action).not.toHaveBeenCalled();
});
it('uses the existing password visibility toggle', () => {
	mount();
	const suffix = screen.getAllByTestId('Input_Suffix')[0];
	fireEvent.click(suffix.querySelector('svg')!);
	expect(input('password')).toHaveAttribute('type', 'text');
	fireEvent.click(suffix.querySelector('svg')!);
	expect(input('password')).toHaveAttribute('type', 'password');
});
it('validates on touch and refuses invalid submissions', async () => {
	mount();
	expect(screen.queryByText('Это поле обязательно для заполнения')).not.toBeInTheDocument();
	await fill('', '');
	expect(screen.getAllByText('Это поле обязательно для заполнения').length).toBeGreaterThan(0);
	await submit();
	expect(action).not.toHaveBeenCalled();
	expect(button()).toBeDisabled();
	await fill('Aa1!aaa');
	expect(screen.getAllByText('Минимальная длина 8 символов').length).toBeGreaterThan(0);
	expect(button()).toBeDisabled();
	await fill('Aa1!' + 'a'.repeat(252));
	expect(screen.getAllByText('Максимальная длина 255 символов').length).toBeGreaterThan(0);
	await fill('abcdefgh');
	expect(screen.getAllByText(translation.validation.password.weak).length).toBeGreaterThan(0);
	await fill('Aa1!aaaa', 'Bb2!bbbb');
	expect(screen.getByText('Пароли должны совпадать')).toBeInTheDocument();
	expect(button()).toBeDisabled();
	expect(action).not.toHaveBeenCalled();
});
it.each([8, 255])(
	'submits valid length %s, resets fields, stays on the tab and does not update session',
	async (length) => {
		mount();
		const value = 'Aa1!' + 'a'.repeat(length - 4);
		await fill(value);
		await waitFor(() => expect(button()).toBeEnabled());
		await submit();
		await waitFor(() =>
			expect(screen.getByRole('status')).toHaveTextContent('Пароль успешно изменен'),
		);
		expect(action).toHaveBeenCalledTimes(1);
		expect(action).toHaveBeenCalledWith({ password: value, passwordConfirm: value });
		expect(input('password')).toHaveValue('');
		expect(input('passwordConfirm')).toHaveValue('');
		expect(screen.queryByText('Пароли должны совпадать')).not.toBeInTheDocument();
		expect(window.location.hash).toBe('#change-password');
		expect(replace).not.toHaveBeenCalled();
		expect(signOut).not.toHaveBeenCalled();
		expect(update).not.toHaveBeenCalled();
	},
);
it('guards duplicate submit while pending, including tab remount', async () => {
	let resolve!: (result: ChangePasswordResult) => void;
	action.mockImplementation(
		() =>
			new Promise((r) => {
				resolve = r;
			}),
	);
	mount();
	await fill();
	const form = input('password').closest('form')!;
	await act(async () => {
		fireEvent.submit(form);
		fireEvent.submit(form);
		await Promise.resolve();
	});
	await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
	expect(button()).toBeDisabled();
	fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
	expect(input('password')).toBeNull();
	fireEvent.click(screen.getByRole('tab', { name: 'Смена пароля' }));
	await fill();
	expect(button()).toBeDisabled();
	await submit();
	expect(action).toHaveBeenCalledTimes(1);
	await act(async () => {
		resolve({ status: 'success' });
		await Promise.resolve();
	});
	expect(screen.getByRole('status')).toHaveTextContent('Пароль успешно изменен');
});
it.each([
	'validation-error',
	'unauthenticated',
	'refresh-required',
	'forbidden',
	'not-found',
	'error',
] as const)('preserves fields on %s without redirect, retry or success', async (status) => {
	action.mockResolvedValue({ status });
	mount();
	await fill();
	await submit();
	await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
	expect(input('password')).toHaveValue('Aa1!aaaa');
	expect(input('passwordConfirm')).toHaveValue('Aa1!aaaa');
	expect(action).toHaveBeenCalledTimes(1);
	expect(signOut).not.toHaveBeenCalled();
	expect(replace).not.toHaveBeenCalled();
	expect(update).not.toHaveBeenCalled();
});
it.each(['backend-result-unverified', 'session-update-failed', 'deadline-expired'] as const)(
	'blocks uncertain incomplete/%s across tab changes',
	async (stage) => {
		action.mockResolvedValue({ status: 'incomplete', stage });
		mount();
		await fill();
		await submit();
		await waitFor(() =>
			expect(screen.getByRole('alert')).toHaveTextContent(
				'Пароль мог быть изменён, но обновление сессии не подтверждено. Проверьте авторизацию перед повторной попыткой',
			),
		);
		expect(input('password')).toHaveValue('Aa1!aaaa');
		expect(button()).toBeDisabled();
		await submit();
		expect(action).toHaveBeenCalledTimes(1);
		fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
		fireEvent.click(screen.getByRole('tab', { name: 'Смена пароля' }));
		await fill();
		expect(button()).toBeDisabled();
		await submit();
		expect(action).toHaveBeenCalledTimes(1);
	},
);
it.each([false, true])('shows unknown outcome and prevents retry (thrown: %s)', async (throws) => {
	if (throws) action.mockRejectedValue(new Error('private details'));
	else action.mockResolvedValue({ status: 'outcome-unknown' });
	mount();
	await fill();
	await submit();
	await waitFor(() =>
		expect(screen.getByRole('alert')).toHaveTextContent(
			'Не удалось подтвердить результат смены пароля. Не отправляйте запрос повторно, пока не проверите состояние аккаунта',
		),
	);
	expect(button()).toBeDisabled();
	expect(input('password')).toHaveValue('Aa1!aaaa');
	await submit();
	expect(action).toHaveBeenCalledTimes(1);
	expect(screen.getByRole('alert')).not.toHaveTextContent('private details');
});
it('does not update the unmounted page after a late response', async () => {
	let resolve!: (result: ChangePasswordResult) => void;
	action.mockImplementation(
		() =>
			new Promise((r) => {
				resolve = r;
			}),
	);
	const view = mount();
	await fill();
	await submit();
	view.unmount();
	await act(async () => {
		resolve({ status: 'success' });
		await Promise.resolve();
	});
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
	expect(replace).not.toHaveBeenCalled();
});
