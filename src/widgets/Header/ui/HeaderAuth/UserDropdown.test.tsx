import type { ReactElement } from 'react';

import '@testing-library/jest-dom';
import { act, fireEvent, render as rtlRender, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import { UserDropdown } from './UserDropdown';

const render = (ui: ReactElement) =>
	rtlRender(ui, {
		wrapper: ({ children }) => (
			<NextIntlClientProvider locale="ru" messages={{}}>
				{children}
			</NextIntlClientProvider>
		),
	});
const push = jest.fn();
const replace = jest.fn();
const signOut = jest.fn();
let pathname = '/ru/profile';
const originalFetch = globalThis.fetch;
let fetchMock: jest.Mock;
jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config/i18n/i18nTranslations'),
	i18Namespace: { header: 'header', translation: 'translation' },
	ROUTES: jest.requireActual('@/shared/config').ROUTES,
	useRouter: jest.requireActual('@/shared/config').useRouter,
	usePathname: jest.requireActual('@/shared/config').usePathname,
}));
jest.mock('next/navigation', () => ({
	usePathname: () => pathname,
	useRouter: () => ({ push, replace }),
}));
jest.mock('@/shared/libs', () => ({
	...jest.requireActual('@/shared/libs'),
	useScreenSize: () => ({ isMobile: false, isTablet: false }),
}));
jest.mock('next-auth/react', () => ({ signOut: (...args: unknown[]) => signOut(...args) }));
jest.mock('next-intl', () => ({
	...jest.requireActual('next-intl'),
	useTranslations: (namespace: string) => {
		const { createTranslator } = jest.requireActual('next-intl');
		return createTranslator({
			locale: 'ru',
			messages: jest.requireActual(`public/locales/ru/${namespace}.json`),
		});
	},
}));
beforeEach(() => {
	fetchMock = jest.fn().mockRejectedValue(new Error('Network forbidden'));
	globalThis.fetch = fetchMock;
	pathname = '/ru/profile';
	window.history.replaceState(null, '', '/ru/profile');
	push.mockReset();
	replace.mockReset();
	signOut.mockReset();
});
afterEach(() => {
	expect(fetchMock).not.toHaveBeenCalled();
	globalThis.fetch = originalFetch;
});
it('opens the existing menu, goes to local profile and closes the Popover', async () => {
	render(<UserDropdown username="Name" image={null} />);
	fireEvent.click(screen.getByRole('button', { expanded: false }));
	fireEvent.click(await screen.findByRole('button', { name: 'Мой профиль' }));
	expect(push).toHaveBeenCalledWith('/ru/profile');
	await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
	expect(signOut).not.toHaveBeenCalled();
});
it('enables membership and settings and preserves logout', async () => {
	signOut.mockResolvedValue({ url: '/auth/login' });
	render(<UserDropdown username="Name" />);
	fireEvent.click(screen.getByRole('button', { expanded: false }));
	expect(await screen.findByRole('button', { name: 'Выбрать членство' })).toBeEnabled();
	expect(screen.getByRole('button', { name: 'Настройки' })).toBeEnabled();
	fireEvent.click(screen.getByRole('button', { name: 'Выйти' }));
	await waitFor(() => expect(replace).toHaveBeenCalledWith('/ru/auth/login'));
	expect(signOut).toHaveBeenCalledWith({ redirect: false });
	expect(push).not.toHaveBeenCalled();
});

it('uses a fallback for failed images and allows a different URL', () => {
	const view = render(<UserDropdown username="Name" image="https://images.example/old" />);
	fireEvent.error(screen.getByRole('img', { name: 'Аватар' }));
	expect(screen.queryByRole('img', { name: 'Аватар' })).toBeNull();
	view.rerender(<UserDropdown username="Name" image="https://images.example/new" />);
	expect(screen.getByRole('img', { name: 'Аватар' })).toHaveAttribute(
		'src',
		'https://images.example/new',
	);
	view.rerender(<UserDropdown username="Name" image={null} />);
	expect(screen.queryByRole('img', { name: 'Аватар' })).toBeNull();
});

it('opens local settings through the real locale-aware router and closes the menu', async () => {
	render(<UserDropdown username="Name" />);
	fireEvent.click(screen.getByRole('button', { expanded: false }));
	const settings = await screen.findByRole('button', { name: 'Настройки' });
	expect(settings).toBeEnabled();
	settings.focus();
	expect(settings).toHaveFocus();
	fireEvent.click(settings);
	expect(push).toHaveBeenCalledTimes(1);
	expect(push).toHaveBeenCalledWith('/ru/settings');
	await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
	expect(replace).not.toHaveBeenCalled();
	expect(signOut).not.toHaveBeenCalled();
});

it('opens locale-aware membership from another page and closes the dropdown', async () => {
	const backend = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network forbidden'));
	try {
		render(<UserDropdown username="Name" />);
		fireEvent.click(screen.getByRole('button', { expanded: false }));
		fireEvent.click(await screen.findByRole('button', { name: 'Выбрать членство' }));
		expect(push).toHaveBeenCalledTimes(1);
		expect(push).toHaveBeenCalledWith('/ru/settings#select-tariff');
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
		expect(backend).not.toHaveBeenCalled();
		expect(signOut).not.toHaveBeenCalled();
	} finally {
		backend.mockRestore();
	}
});
it.each(['account', 'email-verify'])(
	'uses native same-document navigation from #%s with Back/Forward',
	async (hash) => {
		pathname = '/ru/settings';
		window.history.replaceState(null, '', `/ru/settings#${hash}`);
		const nativeHashChange = jest.fn();
		window.addEventListener('hashchange', nativeHashChange);
		const backend = jest
			.spyOn(globalThis, 'fetch')
			.mockRejectedValue(new Error('Network forbidden'));
		try {
			render(<UserDropdown username="Name" />);
			fireEvent.click(screen.getByRole('button', { expanded: false }));
			fireEvent.click(await screen.findByRole('button', { name: 'Выбрать членство' }));
			await waitFor(() => expect(nativeHashChange).toHaveBeenCalled());
			expect(window.location.pathname + window.location.hash).toBe('/ru/settings#select-tariff');
			expect(push).not.toHaveBeenCalled();
			expect(replace).not.toHaveBeenCalled();
			await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
			act(() => window.history.back());
			await waitFor(() => expect(window.location.hash).toBe(`#${hash}`));
			act(() => window.history.forward());
			await waitFor(() => expect(window.location.hash).toBe('#select-tariff'));
			expect(backend).not.toHaveBeenCalled();
			expect(signOut).not.toHaveBeenCalled();
		} finally {
			window.removeEventListener('hashchange', nativeHashChange);
			backend.mockRestore();
		}
	},
);
it('keeps membership blocked while sign-out is pending', async () => {
	let resolve!: (value: { url: string }) => void;
	signOut.mockReturnValue(
		new Promise((done) => {
			resolve = done;
		}),
	);
	render(<UserDropdown username="Name" />);
	fireEvent.click(screen.getByRole('button', { expanded: false }));
	fireEvent.click(await screen.findByRole('button', { name: 'Выйти' }));
	const membership = screen.getByRole('button', { name: 'Выбрать членство' });
	expect(membership).toBeDisabled();
	fireEvent.click(membership);
	expect(push).not.toHaveBeenCalled();
	await act(async () => {
		resolve({ url: '/auth/login' });
		await Promise.resolve();
	});
	expect(replace).toHaveBeenCalledWith('/ru/auth/login');
});
