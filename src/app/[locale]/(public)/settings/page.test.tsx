/** @jest-environment node */
import { notFound } from 'next/navigation';

import type { Session } from 'next-auth';
import { getTranslations } from 'next-intl/server';

import { auth, getHeaderProfile, getOwnProfile, getSettingsSnapshot } from '@/auth';
import { Header, ROUTES, redirect } from '@/shared/config';
import { getTelegramWidgetConfig } from '@/shared/config/telegram.server';
import { SELECT_TARIFF_SETTINGS_TAB } from '@/shared/libs';
import { SettingsShell } from '@/widgets/profile/settings';

import Page, { metadata } from './page';

jest.mock('@/shared/config/telegram.server', () => ({
	getTelegramWidgetConfig: jest.fn(() => ({ status: 'missing' })),
}));

jest.mock('./actions', () => ({
	requestVerificationEmail: jest.fn(),
	linkTelegram: jest.fn(),
	unlinkTelegram: jest.fn(),
	readEmailVerificationStatus: jest.fn(),
}));

const authenticate = jest.fn<Promise<Session | null>, []>();
jest.mock('@/auth', () => ({
	auth: jest.fn(() => authenticate()),
	getOwnProfile: jest.fn(),
	getHeaderProfile: jest.fn(),
	getSettingsSnapshot: jest.fn(),
}));
jest.mock('next/navigation', () => ({
	notFound: jest.fn(() => {
		throw new Error('NOT_FOUND');
	}),
}));
jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config'),
	redirect: jest.fn(() => {
		throw new Error('LOGIN');
	}),
}));
jest.mock('next-intl/server', () => ({
	getRequestConfig: (config: unknown) => config,
	getTranslations: jest.fn(() =>
		Promise.resolve((key: string) => {
			if (key === 'page.error') return 'Ошибка загрузки';
			if (key !== 'user.settings') throw new Error('Unexpected translation key');
			return jest.requireActual('public/locales/ru/header.json').user.settings as string;
		}),
	),
}));
const request = (locale = 'ru') => Page({ params: Promise.resolve({ locale }) });
let fetchSpy: jest.SpyInstance;
beforeEach(() => {
	jest.clearAllMocks();
	jest.mocked(getTelegramWidgetConfig).mockReturnValue({ status: 'missing' });
	const emptySnapshot = {
		userId: 'user',
		email: null,
		isVerified: false,
		telegramUsername: null,
		profiles: [],
		activeProfileId: null,
		subscriptions: [],
	};
	jest
		.mocked(getSettingsSnapshot)
		.mockResolvedValue({ status: 'success', snapshot: emptySnapshot });
	authenticate.mockResolvedValue({ user: { id: 'user' }, expires: '2099-01-01T00:00:00Z' });
	fetchSpy = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Unexpected request'));
});
afterEach(() => jest.restoreAllMocks());
it('renders the UI-only shell for an authenticated user without an active profile or business requests', async () => {
	const shell = await request();
	expect(shell.type).toBe(SettingsShell);
	expect(shell.props).toEqual({
		telegramVerification: {
			botUsername: null,
			telegramUsername: null,
			actions: { link: expect.any(Function), unlink: expect.any(Function) },
		},
		emailVerification: {
			email: null,
			isVerified: false,
			actions: { send: expect.any(Function), read: expect.any(Function) },
		},
	});
	expect(getTranslations).not.toHaveBeenCalled();
	expect(auth).toHaveBeenCalledTimes(1);
	expect(getSettingsSnapshot).toHaveBeenCalledTimes(1);
	expect(getSettingsSnapshot).toHaveBeenCalledWith();
	expect(getOwnProfile).not.toHaveBeenCalled();
	expect(getHeaderProfile).not.toHaveBeenCalled();
	expect(fetchSpy).not.toHaveBeenCalled();
	expect(redirect).not.toHaveBeenCalled();
});
it.each([null, { user: {}, expires: '2099-01-01T00:00:00Z' }])(
	'redirects missing identity to localized login %#',
	async (session) => {
		authenticate.mockResolvedValue(session);
		await expect(request()).rejects.toThrow('LOGIN');
		expect(redirect).toHaveBeenCalledWith({ href: ROUTES.auth.login.page, locale: 'ru' });
		expect(getTranslations).not.toHaveBeenCalled();
		expect(fetchSpy).not.toHaveBeenCalled();
		expect(getSettingsSnapshot).not.toHaveBeenCalled();
	},
);
it('rejects unsupported locales before checking session', async () => {
	await expect(request('unsupported')).rejects.toThrow('NOT_FOUND');
	expect(notFound).toHaveBeenCalledTimes(1);
	expect(auth).not.toHaveBeenCalled();
});
it('keeps route helpers local, including tariff hashes, and excludes indexing', () => {
	expect(ROUTES.settings.page).toBe('/settings');
	expect(SELECT_TARIFF_SETTINGS_TAB).toBe('/settings#select-tariff');
	expect(Header.USER_SETTINGS).toBe('user.settings');
	expect(metadata.robots).toEqual({ index: false, follow: false });
});

it.each(['forbidden', 'error', 'refresh-required', 'identity-mismatch'] as const)(
	'keeps %s distinct from logout without exposing data',
	async (status) => {
		jest.mocked(getSettingsSnapshot).mockResolvedValue({ status });
		const result = await request();
		expect(result.type).toBe(Symbol.for('react.fragment'));
		expect(redirect).not.toHaveBeenCalled();
		expect(getSettingsSnapshot).toHaveBeenCalledTimes(1);
	},
);
it('redirects when backend reports unauthorized', async () => {
	jest.mocked(getSettingsSnapshot).mockResolvedValue({ status: 'unauthenticated' });
	await expect(request()).rejects.toThrow('LOGIN');
});

it.each(['missing', 'invalid'] as const)(
	'does not block settings for %s Telegram config',
	async (status) => {
		jest.mocked(getTelegramWidgetConfig).mockReturnValue({ status });
		const shell = await request();
		expect(shell.type).toBe(SettingsShell);
		expect(shell.props.telegramVerification.botUsername).toBeNull();
		expect(redirect).not.toHaveBeenCalled();
	},
);
it('passes only public Telegram configuration, username and Actions', async () => {
	jest
		.mocked(getTelegramWidgetConfig)
		.mockReturnValue({ status: 'success', botUsername: 'SyntheticBot' });
	const shell = await request();
	expect(shell.props.telegramVerification).toEqual({
		botUsername: 'SyntheticBot',
		telegramUsername: null,
		actions: { link: expect.any(Function), unlink: expect.any(Function) },
	});
	expect(getTelegramWidgetConfig).toHaveBeenCalledTimes(1);
});
