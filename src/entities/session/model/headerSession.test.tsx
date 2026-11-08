/** @jest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';

import type { WebSession } from './session';

let pathname = '/ru/questions';
const router = { replace: jest.fn(), refresh: jest.fn() };
jest.mock('next/navigation', () => ({
	useRouter: () => router,
	usePathname: () => pathname,
	useSearchParams: () => new URLSearchParams(window.location.search),
}));
jest.mock('next-intl', () => ({
	useTranslations: () => Object.assign((key: string) => key, { rich: (key: string) => key }),
}));
jest.mock('@/shared/config', () => ({
	Header: { AUTH_SIGN_IN: 'auth.signIn', AUTH_MENU_ARIA: 'auth.menu' },
	Subscription: { TARIFFS: 'tariffs' },
	i18Namespace: { header: 'header', subscription: 'subscription' },
}));
jest.mock('@/entities/subscription', () => ({
	TariffsButton: () => null,
	TariffsModal: () => null,
}));
jest.mock('./client', () => ({ restoreSession: jest.fn(), endSession: jest.fn() }));
const transport: jest.Mocked<typeof import('./client')> = jest.requireMock('./client');
const store = jest.requireActual<typeof import('./sessionStore')>('./sessionStore');
const { HeaderAuth } = jest.requireActual<
	typeof import('../../../widgets/Header/ui/HeaderAuth/HeaderAuth')
>('../../../widgets/Header/ui/HeaderAuth/HeaderAuth');
const { Login } = jest.requireActual<
	typeof import('../../../features/authentication/login/ui/Login')
>('../../../features/authentication/login/ui/Login');
const account = (username = 'Synthetic'): WebSession => ({
	user: { id: 'fixture-user', username, email: 'fixture@example.invalid', isVerified: true },
	roles: [],
	profiles: [],
	activeProfile: null,
});
beforeEach(() => {
	jest.clearAllMocks();
	transport.restoreSession.mockResolvedValue(null);
	transport.endSession.mockResolvedValue(true);
	store.acceptSession(null);
	localStorage.clear();
	window.history.replaceState(null, '', '/ru/questions');
	pathname = '/ru/questions';
});
afterEach(cleanup);

it.each(['/ru', '/ru/questions', '/ru/questions/react/example?page=2#answer'])(
	'guest login preserves safe current public route %s',
	async (path) => {
		window.history.replaceState(null, '', path);
		pathname = new URL(path, 'http://localhost').pathname;
		render(<HeaderAuth />);
		const links = await screen.findAllByRole('link', { name: 'auth.signIn' });
		const url = new URL(links[0].getAttribute('href')!, 'http://localhost');
		expect(url.pathname).toBe('/ru/auth/login');
		expect(url.searchParams.get('returnPage')).toBe(path);
		expect(transport.restoreSession).toHaveBeenCalledTimes(1);
	},
);

it('restores profile, opens/closes menu, and logs out immediately without reload', async () => {
	transport.restoreSession.mockResolvedValue(account());
	let finish!: (value: boolean) => void;
	transport.endSession.mockReturnValue(
		new Promise((resolve) => {
			finish = resolve;
		}),
	);
	render(<HeaderAuth />);
	const trigger = await screen.findByRole('button', { name: 'profileMenu' });
	expect(screen.queryByRole('link', { name: 'auth.signIn' })).toBeNull();
	fireEvent.click(trigger);
	await screen.findByText('fixture@example.invalid');
	expect(screen.queryByRole('link')).toBeNull(); // Unmigrated private menus are omitted.
	fireEvent.keyDown(document, { key: 'Escape' });
	await waitFor(() => expect(screen.queryByText('fixture@example.invalid')).toBeNull());
	fireEvent.click(trigger);
	await screen.findByText('fixture@example.invalid');
	fireEvent.pointerDown(document.body);
	await waitFor(() => expect(screen.queryByText('fixture@example.invalid')).toBeNull());
	fireEvent.click(trigger);
	fireEvent.click(await screen.findByRole('button', { name: 'logout' }));
	await screen.findByRole('link', { name: 'auth.signIn' });
	expect(screen.queryByText('Synthetic')).toBeNull();
	await act(() => Promise.resolve(finish(true)));
	expect(transport.endSession).toHaveBeenCalledTimes(1);
	expect(router.refresh).toHaveBeenCalled();
});

it('login and Header share restoration and publish success without a reload', async () => {
	global.fetch = jest.fn().mockResolvedValue({
		ok: true,
		json: () => Promise.resolve({ session: account(), returnUrl: '/ru/questions' }),
	});
	render(
		<>
			<HeaderAuth />
			<Login returnPage="/ru/questions" />
		</>,
	);
	await screen.findByLabelText('loginEmailLabel');
	expect(transport.restoreSession).toHaveBeenCalledTimes(1);
	fireEvent.change(screen.getByLabelText('loginEmailLabel'), {
		target: { value: 'fixture@example.invalid' },
	});
	fireEvent.change(screen.getByLabelText('password'), { target: { value: 'synthetic-password' } });
	fireEvent.click(screen.getByRole('button', { name: 'submit' }));
	await screen.findByRole('button', { name: 'profileMenu' });
	expect(router.replace).toHaveBeenCalledWith('/ru/questions');
	expect(screen.queryByRole('button', { name: 'logout' })).toBeNull(); // No temporary login panel.
	expect(screen.queryByText('fixture-user')).toBeNull();
});

it('late restoration cannot replace a newly established account', async () => {
	let resolve!: (value: WebSession | null) => void;
	transport.restoreSession.mockReturnValue(
		new Promise((done) => {
			resolve = done;
		}),
	);
	render(<HeaderAuth />);
	await waitFor(() => expect(transport.restoreSession).toHaveBeenCalledTimes(1));
	act(() => {
		store.beginSessionChange();
		store.acceptSession(account('New account'));
	});
	await act(() => Promise.resolve(resolve(account('Old account'))));
	expect(screen.getByText('New account')).toBeTruthy();
	expect(screen.queryByText('Old account')).toBeNull();
});

it('another tab invalidates old account before re-reading, without storing session data', async () => {
	transport.restoreSession.mockResolvedValue(account('Old account'));
	render(<HeaderAuth />);
	await screen.findByText('Old account');
	let resolve!: (value: WebSession | null) => void;
	transport.restoreSession.mockReturnValue(
		new Promise((done) => {
			resolve = done;
		}),
	);
	act(() => {
		window.dispatchEvent(
			new StorageEvent('storage', { key: 'yh-session-changed', newValue: 'marker' }),
		);
	});
	expect(screen.queryByText('Old account')).toBeNull();
	await waitFor(() => expect(transport.restoreSession).toHaveBeenCalledTimes(2));
	await act(() => Promise.resolve(resolve(account('New account'))));
	await screen.findByText('New account');
	act(() => store.acceptSession(account()));
	expect(Object.keys(localStorage)).toEqual(['yh-session-changed']);
	expect(localStorage.getItem('yh-session-changed')).not.toContain('fixture');
	expect(sessionStorage.length).toBe(0);
});

it('server HTML uses neutral snapshot even when the client has a session', () => {
	store.acceptSession(account());
	const html = renderToString(<HeaderAuth />);
	expect(html).not.toContain('Synthetic');
	expect(html).not.toContain('fixture');
	expect(html).toContain('aria-busy="true"');
});

it('registration establishes the same Header session and defaults to public home', async () => {
	const { Registration } = jest.requireActual<
		typeof import('../../../features/authentication/register/ui/Registration')
	>('../../../features/authentication/register/ui/Registration');
	global.fetch = jest.fn().mockResolvedValue({
		ok: true,
		json: () => Promise.resolve({ session: account(), returnUrl: '/ru/auth/login' }),
	});
	render(
		<>
			<HeaderAuth />
			<Registration />
		</>,
	);
	await screen.findByLabelText('username');
	for (const [field, value] of Object.entries({
		username: 'Synthetic',
		email: 'fixture@example.invalid',
		password: 'StrongPass1!',
		passwordConfirmation: 'StrongPass1!',
	})) {
		fireEvent.change(screen.getByLabelText(field), { target: { value } });
	}
	fireEvent.click(screen.getByRole('checkbox', { name: 'registrationPrivacyPolicy' }));
	fireEvent.click(screen.getByRole('checkbox', { name: 'registrationOffer' }));
	fireEvent.click(screen.getByRole('button', { name: 'registrationSubmit' }));
	await screen.findByRole('button', { name: 'profileMenu' });
	expect(router.replace).toHaveBeenCalledWith('/ru');
	expect(fetch).toHaveBeenCalledTimes(1);
});

it.each([undefined, '//evil.invalid', '/ru/auth/login', '/ru/questions/react/example?x=1#answer'])(
	'authenticated registration redirects safely for %s',
	async (returnPage) => {
		const { Registration } = jest.requireActual<
			typeof import('../../../features/authentication/register/ui/Registration')
		>('../../../features/authentication/register/ui/Registration');
		transport.restoreSession.mockResolvedValue(account());
		render(<Registration returnPage={returnPage} />);
		await waitFor(() =>
			expect(router.replace).toHaveBeenCalledWith(
				returnPage?.startsWith('/ru/questions/') ? returnPage : '/ru',
			),
		);
		expect(screen.queryByLabelText('username')).toBeNull();
	},
);

it('focus refresh clears a previous account and expiration switches to guest', async () => {
	transport.restoreSession.mockResolvedValue(account());
	render(<HeaderAuth />);
	await screen.findByRole('button', { name: 'profileMenu' });
	transport.restoreSession.mockResolvedValue(null);
	act(() => {
		window.dispatchEvent(new Event('focus'));
	});
	expect(screen.queryByText('Synthetic')).toBeNull();
	await screen.findByRole('link', { name: 'auth.signIn' });
});
