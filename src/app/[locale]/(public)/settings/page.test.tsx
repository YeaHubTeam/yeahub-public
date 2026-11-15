/** @jest-environment node */
import { notFound } from 'next/navigation';

import type { Session } from 'next-auth';
import { getTranslations } from 'next-intl/server';

import { auth } from '@/app/_auth/index.server';
import { getSettingsPaymentHistory } from '@/app/_bff/payment/index.server';
import { getHeaderProfile, getOwnProfile } from '@/app/_bff/profile/index.server';
import { getSettingsPageData } from '@/app/_bff/settings/index.server';
import { getSpecializationById } from '@/entities/specialization';
import type { SettingsTariffCatalogResult } from '@/entities/subscription/index.server';
import { Header, ROUTES, redirect } from '@/shared/config';
import { getTelegramWidgetConfig } from '@/shared/config/index.server';
import { SELECT_TARIFF_SETTINGS_TAB } from '@/shared/libs';
import { SettingsShell } from '@/widgets/profile/settings';

import {
	cancelSettingsSubscription,
	createSettingsProfile,
	deleteSettingsAccount,
	deleteSettingsProfile,
	initializeSettingsPayment,
	readSettingsPaymentHistory,
	selectSettingsProfile,
	startSettingsTrial,
} from './actions';
import Page, { metadata } from './page';

jest.mock('@/entities/specialization', () => ({ getSpecializationById: jest.fn() }));

jest.mock('@/shared/config/index.server', () => ({
	getTelegramWidgetConfig: jest.fn(() => ({ status: 'missing' })),
}));

jest.mock('./actions', () => ({
	cancelSettingsSubscription: jest.fn(),
	deleteSettingsAccount: jest.fn(),
	deleteSettingsProfile: jest.fn(),
	createSettingsProfile: jest.fn(),
	selectSettingsProfile: jest.fn(),
	requestVerificationEmail: jest.fn(),
	changePassword: jest.fn(),
	linkTelegram: jest.fn(),
	unlinkTelegram: jest.fn(),
	readEmailVerificationStatus: jest.fn(),
	readSettingsPaymentHistory: jest.fn(),
	startSettingsTrial: jest.fn(),
	initializeSettingsPayment: jest.fn(),
}));

const authenticate = jest.fn<Promise<Session | null>, []>();
jest.mock('@/app/_auth/index.server', () => ({ auth: jest.fn(() => authenticate()) }));
jest.mock('@/app/_bff/profile/index.server', () => ({
	getOwnProfile: jest.fn(),
	getHeaderProfile: jest.fn(),
}));
jest.mock('@/app/_bff/settings/index.server', () => ({ getSettingsPageData: jest.fn() }));
jest.mock('@/app/_bff/payment/index.server', () => ({ getSettingsPaymentHistory: jest.fn() }));
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
	jest
		.mocked(getSettingsPaymentHistory)
		.mockResolvedValue({ status: 'success', items: [], page: 1, limit: 5, total: 0 });
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
	jest.mocked(getSettingsPageData).mockResolvedValue({
		status: 'success',
		snapshot: emptySnapshot,
		tariffs: { status: 'hidden', gate: { status: 'missing', showTariffs: false } },
	});
	authenticate.mockResolvedValue({ user: { id: 'user' }, expires: '2099-01-01T00:00:00Z' });
	fetchSpy = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Unexpected request'));
});
afterEach(() => jest.restoreAllMocks());
it('renders the UI-only shell for an authenticated user without an active profile or business requests', async () => {
	const shell = await request();
	expect(shell.type).toBe(SettingsShell);
	expect(shell.props).toEqual({
		account: { hasPremiumAccess: false, profiles: [], username: 'Server name' },
		paymentHistory: undefined,
		cancelAction: cancelSettingsSubscription,
		cancelSubscriptionId: null,
		trialAction: startSettingsTrial,
		paymentAction: initializeSettingsPayment,
		tariffData: {
			catalog: { status: 'hidden', gate: { status: 'missing', showTariffs: false } },
			canStartTrial: true,
			currentSubscription: null,
		},
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
	expect(getSettingsPageData).toHaveBeenCalledTimes(1);
	expect(getSettingsPageData).toHaveBeenCalledWith();
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
		expect(getSettingsPageData).not.toHaveBeenCalled();
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
		jest.mocked(getSettingsPageData).mockResolvedValue({ status });
		const result = await request();
		expect(result.type).toBe(Symbol.for('react.fragment'));
		expect(redirect).not.toHaveBeenCalled();
		expect(getSettingsPageData).toHaveBeenCalledTimes(1);
	},
);
it('redirects when backend reports unauthorized', async () => {
	jest.mocked(getSettingsPageData).mockResolvedValue({ status: 'unauthenticated' });
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
	jest.mocked(getSettingsPageData).mockResolvedValue({
		status: 'success',
		snapshot,
		tariffs: { status: 'hidden', gate: { status: 'missing', showTariffs: false } },
	});
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
	expect(getSettingsPageData).toHaveBeenCalledTimes(1);
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
	jest.mocked(getSettingsPageData).mockResolvedValue({
		status: 'success',
		snapshot,
		tariffs: { status: 'hidden', gate: { status: 'missing', showTariffs: false } },
	});
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

it.each([
	{ status: 'success', gate: { status: 'allowed', showTariffs: true }, tariffs: [] },
	{ status: 'hidden', gate: { status: 'unavailable', showTariffs: false } },
	{ status: 'error', reason: 'backend' },
] satisfies SettingsTariffCatalogResult[])(
	'passes only the safe tariff $status projection without disabling other Settings sections',
	async (tariffs) => {
		const initial = await getSettingsPageData();
		if (initial.status !== 'success') throw new Error('Expected snapshot fixture');
		jest
			.mocked(getSettingsPageData)
			.mockClear()
			.mockResolvedValue({ ...initial, tariffs });
		const shell = await request();
		expect(getSettingsPageData).toHaveBeenCalledTimes(1);
		expect(shell.type).toBe(SettingsShell);
		expect(shell.props.tariffData).toEqual({
			catalog: tariffs,
			canStartTrial: initial.snapshot.canStartTrial,
			currentSubscription: null,
		});
		expect(shell.props).not.toHaveProperty('snapshot');
		expect(shell.props.account.profiles).toEqual([]);
		expect(fetchSpy).not.toHaveBeenCalled();
	},
);

it.each([
	['active', '2026-02-01T00:00:00.000Z', true],
	['canceled', '2026-02-01T00:00:00.000Z', true],
	['active', '2026-01-01T00:00:00.000Z', true],
	['active', '2025-12-31T23:59:59.999Z', false],
	['canceled', '2025-12-31T00:00:00.000Z', false],
	['pending_payment', '2026-02-01T00:00:00.000Z', false],
	['inactive', '2026-02-01T00:00:00.000Z', false],
	['active', null, false],
	['active', 'invalid', false],
] as const)(
	'projects current subscription %s / %s as %s without private fields',
	async (state, endDate, expected) => {
		jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-01-01T00:00:00.000Z'));
		const initial = await getSettingsPageData();
		if (initial.status !== 'success') throw new Error('Expected fixture');
		jest
			.mocked(getSettingsPageData)
			.mockClear()
			.mockResolvedValue({
				...initial,
				snapshot: {
					...initial.snapshot,
					subscriptions: [
						{
							id: 'synthetic',
							subscriptionId: 2,
							state,
							createDate: '2025-12-01T00:00:00.000Z',
							endDate,
						},
					],
				},
			});
		const shell = await request();
		expect(shell.props.tariffData).toEqual({
			catalog: initial.tariffs,
			canStartTrial: true,
			currentSubscription: expected
				? {
						state,
						daysLeft: endDate === '2026-01-01T00:00:00.000Z' ? 0 : 31,
						daysInCreationMonth: 31,
						endDateLabel:
							endDate === '2026-01-01T00:00:00.000Z' ? '1 января 2026' : '1 февраля 2026',
					}
				: null,
		});
		expect(JSON.stringify(shell.props.tariffData)).not.toMatch(
			/"(?:createDate|endDate|userId|roles|credentials|accessToken)":/,
		);
		expect(getSettingsPageData).toHaveBeenCalledTimes(1);
		expect(fetchSpy).not.toHaveBeenCalled();
	},
);

const subscriptionProjection = async (
	now: string,
	subscriptions: {
		id: string;
		state: 'active' | 'canceled' | 'inactive' | 'pending_payment';
		createDate: string;
		endDate: string | null;
	}[],
) => {
	jest.spyOn(Date, 'now').mockReturnValue(Date.parse(now));
	const initial = await getSettingsPageData();
	if (initial.status !== 'success') throw new Error('Expected fixture');
	jest
		.mocked(getSettingsPageData)
		.mockClear()
		.mockResolvedValue({
			...initial,
			snapshot: {
				...initial.snapshot,
				subscriptions: subscriptions.map((item) => ({ ...item, subscriptionId: 4 })),
			},
		});
	const shell = await request();
	expect(getSettingsPageData).toHaveBeenCalledTimes(1);
	expect(fetchSpy).not.toHaveBeenCalled();
	return shell.props.tariffData.currentSubscription;
};
it('selects the first eligible snapshot record, skipping newer pending/expired records', async () => {
	const common = { createDate: '2026-01-01T00:00:00Z', endDate: '2026-03-01T00:00:00Z' };
	const result = await subscriptionProjection('2026-02-01T00:00:00Z', [
		{ ...common, id: 'pending', state: 'pending_payment' },
		{ ...common, id: 'expired', state: 'active', endDate: '2026-01-31T00:00:00Z' },
		{ ...common, id: 'canceled-first', state: 'canceled' },
		{ ...common, id: 'active-second', state: 'active', endDate: '2026-12-01T00:00:00Z' },
	]);
	expect(result).toEqual({
		state: 'canceled',
		daysLeft: 28,
		daysInCreationMonth: 31,
		endDateLabel: '1 марта 2026',
	});
	expect(Object.keys(result).sort()).toEqual([
		'daysInCreationMonth',
		'daysLeft',
		'endDateLabel',
		'state',
	]);
});
it.each([
	['2025-02-01T00:00:00Z', 28],
	['2024-02-01T00:00:00Z', 29],
	['2026-04-01T00:00:00Z', 30],
	['2026-01-01T00:00:00Z', 31],
])(
	'uses the calendar month of createDate %s rather than the subscription period',
	async (createDate, total) => {
		expect(
			await subscriptionProjection('2026-06-01T00:00:00Z', [
				{
					id: 'year',
					state: 'active',
					createDate,
					endDate: '2027-06-01T00:00:00Z',
				},
			]),
		).toMatchObject({ daysLeft: 365, daysInCreationMonth: total });
	},
);
it.each([
	['2026-02-02T11:59:59Z', 0],
	['2026-02-02T12:00:00Z', 1],
	['2026-02-03T11:59:59Z', 1],
])('counts full local days until %s', async (endDate, daysLeft) => {
	expect(
		await subscriptionProjection('2026-02-01T12:00:00Z', [
			{ id: 's', state: 'active', createDate: '2026-02-01T00:00:00Z', endDate },
		]),
	).toMatchObject({ daysLeft });
});
it('formats a timestamp crossing a date boundary in the fixed UTC test server timezone', async () => {
	expect(
		await subscriptionProjection('2026-01-01T00:00:00Z', [
			{
				id: 's',
				state: 'active',
				createDate: '2026-01-01T00:00:00Z',
				endDate: '2026-02-01T01:00:00+03:00',
			},
		]),
	).toEqual({
		state: 'active',
		daysLeft: 30,
		daysInCreationMonth: 31,
		endDateLabel: '31 января 2026',
	});
});

it.each(['active', 'canceled'] as const)(
	'loads payment page one only for current %s subscription and passes the read-only action',
	async (state) => {
		jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-01-01T00:00:00Z'));
		const initial = await getSettingsPageData();
		if (initial.status !== 'success') throw new Error('Fixture');
		jest
			.mocked(getSettingsPageData)
			.mockClear()
			.mockResolvedValue({
				...initial,
				snapshot: {
					...initial.snapshot,
					subscriptions: [
						{
							id: 's',
							subscriptionId: 4,
							state,
							createDate: '2025-12-01T00:00:00Z',
							endDate: '2026-02-01T00:00:00Z',
						},
					],
				},
			});
		const shell = await request();
		expect(getSettingsPaymentHistory).toHaveBeenCalledTimes(1);
		expect(getSettingsPaymentHistory).toHaveBeenCalledWith();
		expect(shell.props.paymentHistory).toEqual({
			ownerId: initial.snapshot.userId,
			initial: { status: 'success', items: [], page: 1, limit: 5, total: 0 },
			read: readSettingsPaymentHistory,
		});
		expect(readSettingsPaymentHistory).not.toHaveBeenCalled();
		expect(getSettingsPageData).toHaveBeenCalledTimes(1);
		expect(fetchSpy).not.toHaveBeenCalled();
	},
);
it('does not load payment history for the free branch', async () => {
	const shell = await request();
	expect(shell.props.paymentHistory).toBeUndefined();
	expect(getSettingsPaymentHistory).not.toHaveBeenCalled();
});
it.each(['forbidden', 'throw'] as const)(
	'preserves the current subscription and other settings sections after history %s',
	async (kind) => {
		jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-01-01T00:00:00Z'));
		const initial = await getSettingsPageData();
		if (initial.status !== 'success') throw new Error('Fixture');
		jest.mocked(getSettingsPageData).mockResolvedValue({
			...initial,
			snapshot: {
				...initial.snapshot,
				subscriptions: [
					{
						id: 's',
						subscriptionId: 4,
						state: 'active',
						createDate: '2025-12-01T00:00:00Z',
						endDate: '2026-02-01T00:00:00Z',
					},
				],
			},
		});
		if (kind === 'throw')
			jest.mocked(getSettingsPaymentHistory).mockRejectedValue(new Error('Private failure'));
		else jest.mocked(getSettingsPaymentHistory).mockResolvedValue({ status: 'forbidden' });
		const shell = await request();
		expect(shell.props.tariffData.currentSubscription).not.toBeNull();
		expect(shell.props.paymentHistory.initial).toEqual({
			status: kind === 'throw' ? 'error' : 'forbidden',
		});
		expect(shell.props.account).toBeDefined();
		expect(redirect).not.toHaveBeenCalled();
	},
);

it('passes the existing trial action without invoking it or exposing trial inputs', async () => {
	const shell = await request();
	expect(shell.props.trialAction).toBe(startSettingsTrial);
	expect(startSettingsTrial).not.toHaveBeenCalled();
	expect(shell.props.tariffData).not.toHaveProperty('userId');
	expect(shell.props.tariffData).not.toHaveProperty('accessToken');
});

it('passes payment initialization without invoking it at render', async () => {
	const shell = await request();
	expect(shell.props.paymentAction).toBe(initializeSettingsPayment);
	expect(initializeSettingsPayment).not.toHaveBeenCalled();
});

it('passes the cancellation Action and only the displayed subscription UUID without invoking it', async () => {
	const id = '22222222-2222-4222-8222-222222222222';
	const base = await getSettingsPageData();
	if (base.status !== 'success') throw new Error('Fixture');
	jest.mocked(getSettingsPageData).mockResolvedValue({
		...base,
		snapshot: {
			...base.snapshot,
			subscriptions: [
				{
					id: 'new-pending',
					subscriptionId: 3,
					state: 'pending_payment',
					createDate: '2090-01-01T00:00:00Z',
					endDate: null,
				},
				{
					id,
					subscriptionId: 2,
					state: 'active',
					createDate: '2026-01-01T00:00:00Z',
					endDate: '2099-01-01T00:00:00Z',
				},
			],
		},
	});
	const shell = await request();
	expect(shell.props.cancelAction).toBe(cancelSettingsSubscription);
	expect(shell.props.cancelSubscriptionId).toBe(id);
	expect(shell.props.tariffData.currentSubscription).not.toHaveProperty('subscriptionId');
	expect(cancelSettingsSubscription).not.toHaveBeenCalled();
});
