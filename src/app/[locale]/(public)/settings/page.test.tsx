/** @jest-environment node */
import { notFound } from 'next/navigation';

import type { Session } from 'next-auth';
import { getTranslations } from 'next-intl/server';

import { auth, getHeaderProfile, getOwnProfile, getSettingsSnapshot } from '@/auth';
import { getSpecializationById } from '@/entities/specialization';
import { Header, ROUTES, redirect } from '@/shared/config';
import { getTelegramWidgetConfig } from '@/shared/config/telegram.server';
import { SELECT_TARIFF_SETTINGS_TAB } from '@/shared/libs';
import { SettingsShell } from '@/widgets/profile/settings';

import {
	createSettingsProfile,
	deleteSettingsAccount,
	deleteSettingsProfile,
	selectSettingsProfile,
} from './actions';
import Page, { metadata } from './page';

jest.mock('@/entities/specialization', () => ({ getSpecializationById: jest.fn() }));

jest.mock('@/shared/config/telegram.server', () => ({
	getTelegramWidgetConfig: jest.fn(() => ({ status: 'missing' })),
}));

jest.mock('./actions', () => ({
	deleteSettingsAccount: jest.fn(),
	deleteSettingsProfile: jest.fn(),
	createSettingsProfile: jest.fn(),
	selectSettingsProfile: jest.fn(),
	requestVerificationEmail: jest.fn(),
	changePassword: jest.fn(),
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
		username: 'Server name',
		hasPremiumAccess: false,
		canStartTrial: true,
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
		account: { hasPremiumAccess: false, profiles: [], username: 'Server name' },
		deleteAccountAction: deleteSettingsAccount,
		profileActions: {
			select: selectSettingsProfile,
			create: createSettingsProfile,
			delete: deleteSettingsProfile,
		},
		passwordAction: expect.any(Function),
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

it('loads unique specialization titles on the server, preserving order and isolating failures', async () => {
	const snapshot = {
		userId: 'user',
		username: 'Private',
		hasPremiumAccess: true,
		canStartTrial: false,
		email: null,
		isVerified: false,
		telegramUsername: null,
		activeProfileId: 'first',
		subscriptions: [],
		profiles: [
			{ id: 'second', specializationId: 2, isActive: false },
			{ id: 'first', specializationId: 1, isActive: true },
			{ id: 'again', specializationId: 2, isActive: false },
			{ id: 'empty', specializationId: 0, isActive: false },
		],
	};
	jest.mocked(getSettingsSnapshot).mockResolvedValue({ status: 'success', snapshot });
	jest
		.mocked(getSpecializationById)
		.mockImplementation((id) =>
			id === 2
				? Promise.resolve({ id: 2, title: 'Backend', slug: 'backend', description: 'Not passed' })
				: Promise.reject(new Error('Private')),
		);
	const shell = await request();
	expect(shell.props.account).toEqual({
		hasPremiumAccess: true,
		username: 'Private',
		profiles: [
			{ id: 'second', specializationId: 2, isActive: false, specializationTitle: 'Backend' },
			{ id: 'first', specializationId: 1, isActive: true, specializationTitle: null },
			{ id: 'again', specializationId: 2, isActive: false, specializationTitle: 'Backend' },
			{ id: 'empty', specializationId: 0, isActive: false, specializationTitle: null },
		],
	});
	expect(getSpecializationById).toHaveBeenCalledTimes(2);
	expect(getSpecializationById).not.toHaveBeenCalledWith(0);
	expect(getSettingsSnapshot).toHaveBeenCalledTimes(1);
	expect(JSON.stringify(shell.props.account)).not.toMatch(
		/email|subscriptions|userId|slug|description/,
	);
});
it('does not substitute an unrelated specialization returned by the directory', async () => {
	const snapshot = {
		userId: 'user',
		username: null,
		hasPremiumAccess: false,
		canStartTrial: true,
		email: null,
		isVerified: false,
		telegramUsername: null,
		activeProfileId: null,
		subscriptions: [],
		profiles: [{ id: 'one', specializationId: 2, isActive: false }],
	};
	jest.mocked(getSettingsSnapshot).mockResolvedValue({ status: 'success', snapshot });
	jest
		.mocked(getSpecializationById)
		.mockResolvedValue({ id: 3, title: 'Wrong', slug: 'wrong', description: '' });
	const shell = await request();
	expect(shell.props.account.profiles[0].specializationTitle).toBeNull();
});

it('passes profile Server Actions as props without invoking them during render', async () => {
	const shell = await request();
	expect(shell.props.profileActions).toEqual({
		select: selectSettingsProfile,
		create: createSettingsProfile,
		delete: deleteSettingsProfile,
	});
	expect(selectSettingsProfile).not.toHaveBeenCalled();
	expect(createSettingsProfile).not.toHaveBeenCalled();
	expect(deleteSettingsProfile).not.toHaveBeenCalled();
});

it('passes account deletion only as an action prop without invoking it', async () => {
	const shell = await request();
	expect(shell.props.deleteAccountAction).toBe(deleteSettingsAccount);
	expect(deleteSettingsAccount).not.toHaveBeenCalled();
});
