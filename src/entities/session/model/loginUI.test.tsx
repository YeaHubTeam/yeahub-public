/** @jest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { validateLogin } from './loginValidation';

const router = { replace: jest.fn(), refresh: jest.fn() };
const translate = (key: string) => key;
jest.mock('next/navigation', () => ({ useRouter: () => router }));
jest.mock('next-intl', () => ({ useTranslations: () => translate }));
jest.mock('@/entities/session', () => ({
	...jest.requireActual<typeof import('../index')>('../index'),
	restoreSession: jest.fn(),
	endSession: jest.fn(),
}));
const api: jest.Mocked<typeof import('../index')> = jest.requireMock('@/entities/session');
const { Login } = jest.requireActual<
	typeof import('../../../features/authentication/login/ui/Login')
>('../../../features/authentication/login/ui/Login');
const session = { user: { id: '1', username: 'Tester' }, activeProfile: null };
beforeEach(() => {
	jest.clearAllMocks();
	api.restoreSession.mockResolvedValue(null);
	global.fetch = jest.fn();
});
afterEach(cleanup);
const ready = async () => {
	const button = screen.getByRole<HTMLButtonElement>('button', { name: 'submit' });
	await waitFor(() => expect(button.disabled).toBe(false));
	return button;
};
const fill = () => {
	fireEvent.change(screen.getByLabelText('loginEmailLabel'), {
		target: { value: 'user@local.invalid' },
	});
	fireEvent.change(screen.getByLabelText('password'), { target: { value: 'example' } });
};
it('валидирует обязательность и формат как React, email trim', () => {
	expect(validateLogin({ username: '', password: '' })).toEqual({
		username: 'loginRequired',
		password: 'loginRequired',
	});
	expect(validateLogin({ username: 'invalid', password: 'x' })).toEqual({
		username: 'loginEmailInvalid',
	});
	expect(validateLogin({ username: ' user@local.invalid ', password: 'x' })).toEqual({});
});
it('ошибки до BFF, show/hide, Telegram отключён, register сохраняет returnPage', async () => {
	render(<Login returnPage="/ru/questions/react/example" />);
	const button = await ready();
	fireEvent.click(button);
	expect(screen.getAllByText('loginRequired')).toHaveLength(2);
	fireEvent.change(screen.getByLabelText('loginEmailLabel'), { target: { value: 'bad' } });
	expect(screen.getByText('loginEmailInvalid')).toBeTruthy();
	fireEvent.click(screen.getByRole('button', { name: 'showPassword' }));
	expect(screen.getByLabelText('password').getAttribute('type')).toBe('text');
	fireEvent.click(screen.getByRole('button', { name: 'hidePassword' }));
	expect(screen.getByLabelText('password').getAttribute('type')).toBe('password');
	expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Telegram' }).disabled).toBe(true);
	expect(screen.getByRole('link', { name: 'register' }).getAttribute('href')).toContain(
		'returnPage=%2Fru%2Fquestions%2Freact%2Fexample',
	);
	expect(fetch).not.toHaveBeenCalled();
});
it.each([401, 503])('отображает ошибку HTTP %s и снимает loading', async (status) => {
	(fetch as jest.Mock).mockResolvedValue({ ok: false, status });
	render(<Login />);
	const button = await ready();
	fill();
	fireEvent.click(button);
	await screen.findByText(status === 401 ? 'invalidCredentials' : 'unavailable');
	expect(button.disabled).toBe(false);
});
it('успех login ведёт на безопасный returnPage, без повторного submit', async () => {
	(fetch as jest.Mock).mockResolvedValue({
		ok: true,
		json: () => Promise.resolve({ session, returnUrl: '/ru/questions/react/example' }),
	});
	render(<Login />);
	const button = await ready();
	fill();
	fireEvent.click(button);
	fireEvent.click(button);
	await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/ru/questions/react/example'));
	expect(fetch).toHaveBeenCalledTimes(1);
});
it('restoration показывает профиль и logout завершает сессию', async () => {
	api.restoreSession.mockResolvedValue(session as Awaited<ReturnType<typeof api.restoreSession>>);
	api.endSession.mockResolvedValue(true);
	render(<Login />);
	const button = await screen.findByRole('button', { name: 'logout' });
	await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
	fireEvent.click(button);
	await screen.findByText('signedOut');
	expect(api.endSession).toHaveBeenCalledTimes(1);
	expect(screen.getByRole('button', { name: 'submit' })).toBeTruthy();
});
