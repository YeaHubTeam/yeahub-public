import { registerAccount } from './registrationClient';

const valid = {
	username: 'LocalUser',
	email: 'user@local.invalid',
	password: 'StrongPass1!',
	passwordConfirmation: 'StrongPass1!',
	privacyConsent: true,
	offerConsent: true,
	adConsent: false,
};
let fetchMock: jest.Mock;
beforeEach(() => {
	Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} });
	fetchMock = jest.fn();
	global.fetch = fetchMock;
});
it('успешная регистрация возвращает только session/returnUrl клиенту', async () => {
	const session = { user: { id: 'local' }, activeProfile: null };
	fetchMock.mockResolvedValue(
		Response.json({ session, returnUrl: '/ru/questions' }, { status: 201 }),
	);
	expect(await registerAccount(valid, '/ru/questions')).toEqual({
		ok: true,
		session,
		returnUrl: '/ru/questions',
	});
	expect(fetchMock.mock.calls[0][1]).toMatchObject({
		method: 'POST',
		cache: 'no-store',
		credentials: 'same-origin',
	});
});
it('ошибки полей и конфликт email сохраняются', async () => {
	fetchMock.mockResolvedValue(
		Response.json(
			{ error: 'ACCOUNT_CONFLICT', fields: { email: 'accountConflict' } },
			{ status: 409 },
		),
	);
	expect(await registerAccount(valid)).toEqual({
		ok: false,
		error: 'ACCOUNT_CONFLICT',
		fields: { email: 'accountConflict' },
	});
});
it('сетевая ошибка не повторяет создание аккаунта', async () => {
	fetchMock.mockRejectedValue(new Error('offline'));
	await expect(registerAccount(valid)).rejects.toThrow('offline');
	expect(fetchMock).toHaveBeenCalledTimes(1);
});
it('использует тот же browser Web Lock, что AUTH-01', async () => {
	const lock = jest.fn((_name: string, action: () => Promise<unknown>) => action());
	Object.defineProperty(globalThis, 'navigator', {
		configurable: true,
		value: { locks: { request: lock } },
	});
	fetchMock.mockResolvedValue(
		Response.json(
			{ session: { user: { id: 'local' } }, returnUrl: '/ru/auth/login' },
			{ status: 201 },
		),
	);
	await registerAccount(valid);
	expect(lock).toHaveBeenCalledWith('yh-web-session', expect.any(Function));
});
