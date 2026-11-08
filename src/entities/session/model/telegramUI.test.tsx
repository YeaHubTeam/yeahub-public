/** @jest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const router = { replace: jest.fn(), refresh: jest.fn() };
const translate = (key: string) => key;
jest.mock('next/navigation', () => ({ useRouter: () => router }));
jest.mock('next-intl', () => ({ useTranslations: () => translate }));
const { TelegramAuth } = jest.requireActual<
	typeof import('../../../features/authentication/telegram')
>('../../../features/authentication/telegram');
const payload = () => ({
	id: 123456,
	first_name: 'Synthetic',
	auth_date: Math.floor(Date.now() / 1000),
	hash: 'a'.repeat(64),
});
const session = {
	user: { id: 'user', username: 'synthetic', email: null, isVerified: true },
	roles: [],
	profiles: [],
	activeProfile: null,
};
const callback = () => Object.values(window.YeaHubTelegramCallbacks!)[0];
beforeEach(() => {
	jest.clearAllMocks();
	global.fetch = jest.fn();
});
afterEach(cleanup);
it('unconfigured flow keeps disabled placeholder, no external widget or request', () => {
	render(<TelegramAuth />);
	expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Telegram' }).disabled).toBe(true);
	expect(document.querySelector('script[src^="https://telegram.org/"]')).toBeNull();
	expect(fetch).not.toHaveBeenCalled();
});
it('mounts original widget settings with unique callback; cleans script, iframe, handlers on unmount', async () => {
	const view = render(<TelegramAuth botName="example_test_bot" />);
	const script = document.querySelector<HTMLScriptElement>('script[src^="https://telegram.org/"]')!;
	expect(script.getAttribute('data-telegram-login')).toBe('example_test_bot');
	expect(script.getAttribute('data-radius')).toBe('15');
	expect(script.getAttribute('data-size')).toBe('large');
	expect(script.getAttribute('data-lang')).toBe('en');
	expect(script.getAttribute('data-request-access')).toBe('write');
	expect(script.getAttribute('data-userpic')).toBe('true');
	await act(() => {
		script.parentElement!.appendChild(document.createElement('iframe'));
		return Promise.resolve();
	});
	expect(screen.queryByText('telegram.widgetLoading')).toBeNull();
	const saved = callback();
	view.unmount();
	expect(window.YeaHubTelegramCallbacks).toBeUndefined();
	expect(document.querySelector('script[src^="https://telegram.org/"]')).toBeNull();
	await act(() => Promise.resolve(saved(payload())));
	expect(fetch).not.toHaveBeenCalled();
});
it('cancel, invalid payload never call BFF or mutate session', async () => {
	render(<TelegramAuth botName="example_test_bot" />);
	await act(() => Promise.resolve(callback()(null)));
	expect(screen.getByText('telegram.cancelled')).toBeTruthy();
	await act(() => Promise.resolve(callback()({ id: 1 })));
	expect(screen.getByText('telegram.invalid')).toBeTruthy();
	expect(fetch).not.toHaveBeenCalled();
	expect(router.replace).not.toHaveBeenCalled();
});
it('script failure shows safe error and explicit retry mounts a fresh widget', async () => {
	render(<TelegramAuth botName="example_test_bot" />);
	const old = callback();
	fireEvent.error(document.querySelector('script[src^="https://telegram.org/"]')!);
	expect(screen.getByText('telegram.widgetFailed')).toBeTruthy();
	fireEvent.click(screen.getByRole('button', { name: 'telegram.retry' }));
	expect(callback()).not.toBe(old);
	await act(() => Promise.resolve(old(payload())));
	expect(fetch).not.toHaveBeenCalled();
});
it('one signed callback creates session and safely navigates; repeated callback never posts twice', async () => {
	let resolve!: (value: unknown) => void;
	(fetch as jest.Mock).mockReturnValue(
		new Promise((done) => {
			resolve = done;
		}),
	);
	const onSuccess = jest.fn(),
		onPending = jest.fn();
	render(
		<TelegramAuth
			botName="example_test_bot"
			returnPage="/ru/questions"
			onSuccess={onSuccess}
			onPendingChange={onPending}
		/>,
	);
	const cb = callback(),
		data = payload();
	await act(() => Promise.resolve(cb(data)));
	await act(() => Promise.resolve(cb(data)));
	expect(fetch).toHaveBeenCalledTimes(1);
	expect(onPending).toHaveBeenCalledWith(true);
	expect(JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)).toEqual({
		payload: data,
		returnPage: '/ru/questions',
	});
	expect((fetch as jest.Mock).mock.calls[0][1]).toMatchObject({
		credentials: 'same-origin',
		cache: 'no-store',
		method: 'POST',
	});
	await act(() =>
		Promise.resolve(
			resolve({ ok: true, json: () => Promise.resolve({ session, returnUrl: '/ru/questions' }) }),
		),
	);
	expect(onSuccess).toHaveBeenCalledWith(session);
	expect(router.replace).toHaveBeenCalledWith('/ru/questions');
	expect(router.refresh).toHaveBeenCalled();
	await act(() => Promise.resolve(cb(data)));
	expect(fetch).toHaveBeenCalledTimes(1);
	expect(Object.keys(localStorage)).toEqual(['yh-session-changed']);
	expect(localStorage.getItem('yh-session-changed')).not.toContain(session.user.id);
	expect(sessionStorage.length).toBe(0);
});
it.each(['TELEGRAM_EXPIRED', 'TELEGRAM_INVALID', 'TELEGRAM_DENIED', 'AUTH_UNAVAILABLE'])(
	'backend %s displayed without payload/token echoes, no automatic retry',
	async (error) => {
		(fetch as jest.Mock).mockResolvedValue({
			ok: false,
			json: () => Promise.resolve({ error, private: 'must-not-display' }),
		});
		render(<TelegramAuth botName="example_test_bot" />);
		const cb = callback(),
			data = payload();
		await act(() => Promise.resolve(cb(data)));
		await screen.findByRole('alert');
		expect(screen.queryByText('must-not-display')).toBeNull();
		await act(() => Promise.resolve(cb(data)));
		expect(fetch).toHaveBeenCalledTimes(1);
		expect(router.replace).not.toHaveBeenCalled();
	},
);
it('network failure is safe; explicit retry permits a new attempt', async () => {
	(fetch as jest.Mock).mockRejectedValue(new Error('private-error'));
	render(<TelegramAuth botName="example_test_bot" />);
	await act(() => Promise.resolve(callback()(payload())));
	await screen.findByText('telegram.unavailable');
	expect(screen.queryByText('private-error')).toBeNull();
	fireEvent.click(screen.getByRole('button', { name: 'telegram.retry' }));
	(fetch as jest.Mock).mockResolvedValue({
		ok: true,
		json: () => Promise.resolve({ session, returnUrl: 'https://evil.invalid' }),
	});
	await act(() => Promise.resolve(callback()(payload())));
	await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/ru'));
	expect(fetch).toHaveBeenCalledTimes(2);
});
it('disabled form cannot start Telegram callback', async () => {
	render(<TelegramAuth botName="example_test_bot" disabled />);
	await act(() => Promise.resolve(callback()(payload())));
	expect(fetch).not.toHaveBeenCalled();
});

it('widget timeout never leaves a loading loop or sends an auth request', () => {
	jest.useFakeTimers();
	try {
		render(<TelegramAuth botName="example_test_bot" />);
		act(() => jest.advanceTimersByTime(10000));
		expect(screen.getByText('telegram.widgetFailed')).toBeTruthy();
		expect(screen.queryByText('telegram.widgetLoading')).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
		expect(window.YeaHubTelegramCallbacks).toBeUndefined();
	} finally {
		cleanup();
		jest.useRealTimers();
	}
});

it('widget instances have independent callbacks; removing one does not remove the other', () => {
	const view = render(
		<>
			<TelegramAuth key="a" botName="example_test_bot" />
			<TelegramAuth key="b" botName="example_test_bot" />
		</>,
	);
	const entries = Object.values(window.YeaHubTelegramCallbacks!);
	expect(entries).toHaveLength(2);
	expect(entries[0]).not.toBe(entries[1]);
	view.rerender(
		<>
			<TelegramAuth key="b" botName="example_test_bot" />
		</>,
	);
	expect(Object.values(window.YeaHubTelegramCallbacks!)).toEqual([entries[1]]);
});
