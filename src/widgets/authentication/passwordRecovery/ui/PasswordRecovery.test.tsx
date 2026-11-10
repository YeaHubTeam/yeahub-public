import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { PasswordRecovery } from '../index';

jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config/i18n/i18nTranslations'),
	i18Namespace: { auth: 'auth', translation: 'translation' },
	ROUTES: { auth: { login: { page: '/auth/login' } } },
}));
jest.mock('next-intl', () => ({
	useLocale: () => 'ru',
	useTranslations: (namespace: string) => {
		const { createTranslator } = jest.requireActual('next-intl');
		return createTranslator({
			locale: 'ru',
			messages: jest.requireActual(`public/locales/ru/${namespace}.json`),
		});
	},
}));
jest.mock('@/shared/libs', () => ({
	passwordRules: jest.requireActual('@/shared/libs/app/regexp').passwordRules,
}));
jest.mock('@/shared/ui/Icon', () => ({ Icon: () => null }));
const fields = () => screen.getAllByPlaceholderText('Пароль');
const button = () => screen.getByRole('button', { name: 'Сохранить' });
const fill = (a = 'OriginalCASE1!', b = a) => {
	[a, b].forEach((value, i) => {
		fireEvent.change(fields()[i], { target: { value } });
		fireEvent.blur(fields()[i]);
	});
};
let fetchMock: jest.Mock;
let write: jest.SpyInstance;
let read: jest.SpyInstance;
const originalFetch = globalThis.fetch;
beforeEach(() => {
	fetchMock = jest.fn();
	globalThis.fetch = fetchMock;
	write = jest.spyOn(Storage.prototype, 'setItem');
	read = jest.spyOn(Storage.prototype, 'getItem');
});
afterEach(() => {
	expect(fetchMock).not.toHaveBeenCalled();
	expect(write).not.toHaveBeenCalled();
	expect(read).not.toHaveBeenCalled();
	write.mockRestore();
	read.mockRestore();
	globalThis.fetch = originalFetch;
});
it('renders password fields and localized labels', () => {
	render(<PasswordRecovery resetPasswordAction={jest.fn()} />);
	expect(screen.getByText('Введите новый пароль')).toBeInTheDocument();
	expect(screen.getByText('Повторите пароль')).toBeInTheDocument();
	expect(fields()).toHaveLength(2);
	for (const field of fields()) expect(field).toHaveAttribute('type', 'password');
	expect(button()).toBeDisabled();
});
it('shows RHF errors and does not submit invalid values', async () => {
	const submit = jest.fn();
	render(<PasswordRecovery resetPasswordAction={submit} />);
	fill('OriginalCASE1!', 'DifferentCASE1!');
	expect(await screen.findByText('Пароли должны совпадать')).toBeInTheDocument();
	fireEvent.submit(button().closest('form')!);
	await waitFor(() => expect(button()).toBeDisabled());
	expect(submit).not.toHaveBeenCalled();
});
it('submits the original case and exact field values', async () => {
	const submit = jest.fn().mockResolvedValue({ status: 'success' });
	render(<PasswordRecovery resetPasswordAction={submit} />);
	fill();
	await waitFor(() => expect(button()).toBeEnabled());
	fireEvent.click(button());
	await waitFor(() => expect(submit).toHaveBeenCalledWith('OriginalCASE1!', 'OriginalCASE1!'));
});
it('preserves spaces and rejects them under real Yup rules', async () => {
	const submit = jest.fn();
	render(<PasswordRecovery resetPasswordAction={submit} />);
	fill(' OriginalCASE1! ');
	await waitFor(() => expect(button()).toBeDisabled());
	expect(fields()[0]).toHaveValue(' OriginalCASE1! ');
	expect(submit).not.toHaveBeenCalled();
});
it('blocks duplicate submits while pending', async () => {
	let finish: ((value: { status: 'error' }) => void) | undefined;
	const submit = jest.fn(
		() =>
			new Promise<{ status: 'error' }>((resolve) => {
				finish = resolve;
			}),
	);
	render(<PasswordRecovery resetPasswordAction={submit} />);
	fill();
	await waitFor(() => expect(button()).toBeEnabled());
	fireEvent.submit(button().closest('form')!);
	fireEvent.submit(button().closest('form')!);
	await waitFor(() => expect(button()).toHaveAttribute('aria-busy', 'true'));
	expect(button()).toBeDisabled();
	expect(submit).toHaveBeenCalledTimes(1);
	await act(async () => {
		finish?.({ status: 'error' });
		await Promise.resolve();
	});
	await waitFor(() => expect(button()).toBeEnabled());
});
it('handles rejected callback safely', async () => {
	render(
		<PasswordRecovery
			resetPasswordAction={jest.fn().mockRejectedValue(new Error('private details'))}
		/>,
	);
	fill();
	await waitFor(() => expect(button()).toBeEnabled());
	fireEvent.click(button());
	expect(await screen.findByRole('alert')).toHaveTextContent(
		'Не удалось изменить пароль. Попробуйте ещё раз позже.',
	);
	expect(screen.queryByText('private details')).toBeNull();
	await waitFor(() => expect(button()).toBeEnabled());
});

it('replaces form with success and a native localized no-referrer link', async () => {
	render(
		<PasswordRecovery resetPasswordAction={jest.fn().mockResolvedValue({ status: 'success' })} />,
	);
	fill();
	await waitFor(() => expect(button()).toBeEnabled());
	fireEvent.click(button());
	expect(await screen.findByRole('status')).toHaveTextContent(
		'Пароль успешно изменён. Войдите с новым паролем.',
	);
	const link = screen.getByRole('link', { name: 'Перейти ко входу' });
	expect(link).toHaveAttribute('href', '/ru/auth/login');
	expect(link).toHaveAttribute('referrerpolicy', 'no-referrer');
	expect(link).toHaveAttribute('rel', 'noreferrer');
	expect(screen.queryByRole('button', { name: 'Сохранить' })).toBeNull();
});
it.each(['validation-error', 'error', 'invalid-token'])('handles %s', async (status) => {
	render(<PasswordRecovery resetPasswordAction={jest.fn().mockResolvedValue({ status })} />);
	fill();
	await waitFor(() => expect(button()).toBeEnabled());
	fireEvent.click(button());
	expect(await screen.findByRole('alert')).toHaveTextContent(
		status === 'invalid-token'
			? 'Ссылка восстановления недействительна или срок её действия истёк.'
			: 'Не удалось изменить пароль.',
	);
	expect(screen.queryByRole('status')).toBeNull();
});
