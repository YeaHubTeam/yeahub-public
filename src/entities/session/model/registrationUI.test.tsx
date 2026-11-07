/** @jest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const router = { replace: jest.fn(), refresh: jest.fn() };
const translate = Object.assign((key: string) => key, { rich: (key: string) => key });
jest.mock('next/navigation', () => ({ useRouter: () => router }));
jest.mock('next-intl', () => ({ useTranslations: () => translate }));
jest.mock('@/entities/session', () => ({
	...jest.requireActual<typeof import('../index')>('../index'),
	restoreSession: jest.fn(),
	registerAccount: jest.fn(),
}));
const sessionApi: jest.Mocked<typeof import('../index')> = jest.requireMock('@/entities/session');
const { Registration } = jest.requireActual<
	typeof import('../../../features/authentication/register/ui/Registration')
>('../../../features/authentication/register/ui/Registration');

beforeEach(() => {
	jest.clearAllMocks();
	sessionApi.restoreSession.mockResolvedValue(null);
});
afterEach(cleanup);
const fill = () => {
	for (const [name, value] of Object.entries({
		username: 'LocalUser',
		email: 'user@local.invalid',
		password: 'StrongPass1!',
		passwordConfirmation: 'StrongPass1!',
	})) {
		fireEvent.change(screen.getByLabelText(name), { target: { value } });
	}
	fireEvent.click(screen.getByRole('checkbox', { name: 'registrationPrivacyPolicy' }));
	fireEvent.click(screen.getByRole('checkbox', { name: 'registrationOffer' }));
};
it('проверяет поля/согласия до отправки', async () => {
	render(<Registration />);
	const button = screen.getByRole<HTMLButtonElement>('button', { name: 'registrationSubmit' });
	await waitFor(() =>
		expect(screen.getByLabelText<HTMLInputElement>('username').disabled).toBe(false),
	);
	fireEvent.submit(button.closest('form')!);
	expect(screen.getAllByText('registrationRequired')).toHaveLength(4);
	expect(screen.getAllByText('consentRequired')).toHaveLength(2);
	expect(sessionApi.registerAccount).not.toHaveBeenCalled();
});
it('pending блокирует повторный submit, успех сохраняет безопасный returnPage', async () => {
	let resolve!: (value: Awaited<ReturnType<typeof sessionApi.registerAccount>>) => void;
	sessionApi.registerAccount.mockReturnValue(
		new Promise((done) => {
			resolve = done;
		}),
	);
	const target = '/ru/questions/react/example?page=2#answer';
	render(<Registration returnPage={target} />);
	const button = screen.getByRole<HTMLButtonElement>('button', { name: 'registrationSubmit' });
	await waitFor(() =>
		expect(screen.getByLabelText<HTMLInputElement>('username').disabled).toBe(false),
	);
	fill();
	fireEvent.click(button);
	expect(button.disabled).toBe(true);
	fireEvent.click(button);
	expect(sessionApi.registerAccount).toHaveBeenCalledTimes(1);
	expect(sessionApi.registerAccount.mock.calls[0][0].adConsent).toBe(false);
	await act(() =>
		Promise.resolve(
			resolve({
				ok: true,
				session: {
					user: {
						id: 'local',
						username: 'LocalUser',
						email: 'user@local.invalid',
						isVerified: false,
					},
					roles: [],
					profiles: [],
					activeProfile: null,
				},
				returnUrl: target,
			}),
		),
	);
	expect(router.replace).toHaveBeenCalledWith(target);
	expect(router.refresh).toHaveBeenCalled();
});
it('конфликт email отображается, форма снова доступна', async () => {
	sessionApi.registerAccount.mockResolvedValue({
		ok: false,
		error: 'ACCOUNT_CONFLICT',
		fields: { email: 'accountConflict' },
	});
	render(<Registration />);
	const button = screen.getByRole<HTMLButtonElement>('button', { name: 'registrationSubmit' });
	await waitFor(() =>
		expect(screen.getByLabelText<HTMLInputElement>('username').disabled).toBe(false),
	);
	fill();
	fireEvent.click(button);
	await screen.findAllByText('accountConflict');
	await waitFor(() =>
		expect(screen.getByLabelText<HTMLInputElement>('username').disabled).toBe(false),
	);
	expect(router.replace).not.toHaveBeenCalled();
});
it('network failure отображает безопасное сообщение без повторной регистрации', async () => {
	sessionApi.registerAccount.mockRejectedValue(new Error('private-network-error'));
	render(<Registration />);
	const button = screen.getByRole<HTMLButtonElement>('button', { name: 'registrationSubmit' });
	await waitFor(() =>
		expect(screen.getByLabelText<HTMLInputElement>('username').disabled).toBe(false),
	);
	fill();
	fireEvent.click(button);
	await screen.findByText('registrationUnavailable');
	expect(sessionApi.registerAccount).toHaveBeenCalledTimes(1);
	expect(screen.queryByText('private-network-error')).toBeNull();
});

it('показывает/скрывает пароль без submit формы', async () => {
	render(<Registration />);
	await waitFor(() =>
		expect(screen.getByLabelText<HTMLInputElement>('username').disabled).toBe(false),
	);
	const password = screen.getByLabelText<HTMLInputElement>('password');
	expect(password.type).toBe('password');
	fireEvent.click(screen.getAllByRole('button', { name: 'showPassword' })[0]);
	expect(password.type).toBe('text');
	fireEvent.click(screen.getByRole('button', { name: 'hidePassword' }));
	expect(password.type).toBe('password');
	expect(sessionApi.registerAccount).not.toHaveBeenCalled();
});
