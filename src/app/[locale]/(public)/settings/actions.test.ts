/** @jest-environment node */
import { revalidatePath } from 'next/cache';

import { getLocale } from 'next-intl/server';

import {
	cancelOwnSettingsSubscription,
	changeOwnPassword,
	createOwnSettingsProfile,
	deleteOwnSettingsAccount,
	deleteOwnSettingsProfile,
	getSettingsPaymentHistory,
	getSettingsSnapshot,
	initializeOwnSettingsPayment,
	linkOwnTelegram,
	selectOwnSettingsProfile,
	sendOwnVerificationEmail,
	startOwnSettingsTrial,
	unlinkOwnTelegram,
} from '@/auth';
import { getSpecializationById } from '@/entities/specialization';

import {
	cancelSettingsSubscription,
	changePassword,
	createSettingsProfile,
	deleteSettingsAccount,
	deleteSettingsProfile,
	initializeSettingsPayment,
	linkTelegram,
	readEmailVerificationStatus,
	readSettingsPaymentHistory,
	requestVerificationEmail,
	selectSettingsProfile,
	startSettingsTrial,
	unlinkTelegram,
} from './actions';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('next-intl/server', () => ({
	getLocale: jest.fn(() => Promise.resolve('ru')),
	getRequestConfig: (value: unknown) => value,
}));
jest.mock('@/entities/specialization', () => ({ getSpecializationById: jest.fn() }));

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/auth', () => ({
	cancelOwnSettingsSubscription: jest.fn(),
	initializeOwnSettingsPayment: jest.fn(),
	deleteOwnSettingsAccount: jest.fn(),
	deleteOwnSettingsProfile: jest.fn(),
	createOwnSettingsProfile: jest.fn(),
	sendOwnVerificationEmail: jest.fn(),
	startOwnSettingsTrial: jest.fn(),
	changeOwnPassword: jest.fn(),
	getSettingsSnapshot: jest.fn(),
	getSettingsPaymentHistory: jest.fn(),
	selectOwnSettingsProfile: jest.fn(),
	linkOwnTelegram: jest.fn(),
	unlinkOwnTelegram: jest.fn(),
}));
beforeEach(() => jest.clearAllMocks());
it('has no import side effects or client identity argument', () => {
	expect(sendOwnVerificationEmail).not.toHaveBeenCalled();
	expect(requestVerificationEmail.length).toBe(0);
	expect(readEmailVerificationStatus.length).toBe(0);
	expect(getSettingsSnapshot).not.toHaveBeenCalled();
});
it.each([
	'success',
	'unauthenticated',
	'refresh-required',
	'forbidden',
	'rate-limited',
	'already-verified',
	'error',
] as const)('preserves %s without exposing credentials', async (status) => {
	jest.mocked(sendOwnVerificationEmail).mockResolvedValue({ status });
	expect(await requestVerificationEmail()).toEqual({ status });
	expect(sendOwnVerificationEmail).toHaveBeenCalledTimes(1);
	expect(sendOwnVerificationEmail).toHaveBeenCalledWith();
});
it('ignores forged runtime arguments and uses only server identity', async () => {
	jest.mocked(sendOwnVerificationEmail).mockResolvedValue({ status: 'success' });
	const invoke: (input: unknown) => ReturnType<typeof requestVerificationEmail> =
		requestVerificationEmail;
	expect(await invoke({ userId: 'other', accessToken: 'forged' })).toEqual({ status: 'success' });
	expect(sendOwnVerificationEmail).toHaveBeenCalledWith();
});
it('returns a safe error on an unexpected server failure', async () => {
	jest.mocked(sendOwnVerificationEmail).mockRejectedValue(new Error('private backend details'));
	expect(await requestVerificationEmail()).toEqual({ status: 'error' });
});

describe('readEmailVerificationStatus', () => {
	it.each([true, false])(
		'returns only verified status %s from one trusted snapshot read',
		async (isVerified) => {
			jest.mocked(getSettingsSnapshot).mockResolvedValue({
				status: 'success',
				snapshot: {
					userId: 'server-user',
					username: 'Server name',
					hasPremiumAccess: true,
					canStartTrial: false,
					email: 'private@example.invalid',
					isVerified,
					telegramUsername: 'private',
					profiles: [],
					activeProfileId: null,
					subscriptions: [],
				},
			});
			expect(await readEmailVerificationStatus()).toEqual({ status: 'success', isVerified });
			expect(getSettingsSnapshot).toHaveBeenCalledTimes(1);
			expect(getSettingsSnapshot).toHaveBeenCalledWith();
			expect(sendOwnVerificationEmail).not.toHaveBeenCalled();
		},
	);
	it.each(['unauthenticated', 'refresh-required', 'forbidden', 'error'] as const)(
		'preserves %s without inventing isVerified',
		async (status) => {
			jest.mocked(getSettingsSnapshot).mockResolvedValue({ status });
			expect(await readEmailVerificationStatus()).toEqual({ status });
			expect(getSettingsSnapshot).toHaveBeenCalledTimes(1);
			expect(sendOwnVerificationEmail).not.toHaveBeenCalled();
		},
	);
	it('maps identity mismatch to a safe error', async () => {
		jest.mocked(getSettingsSnapshot).mockResolvedValue({ status: 'identity-mismatch' });
		expect(await readEmailVerificationStatus()).toEqual({ status: 'error' });
		expect(getSettingsSnapshot).toHaveBeenCalledTimes(1);
	});
	it('does not forward forged runtime arguments', async () => {
		jest.mocked(getSettingsSnapshot).mockResolvedValue({ status: 'forbidden' });
		const invoke: (input: unknown) => ReturnType<typeof readEmailVerificationStatus> =
			readEmailVerificationStatus;
		expect(await invoke({ userId: 'other', email: 'forged', accessToken: 'forged' })).toEqual({
			status: 'forbidden',
		});
		expect(getSettingsSnapshot).toHaveBeenCalledTimes(1);
		expect(getSettingsSnapshot).toHaveBeenCalledWith();
	});
	it('handles unexpected errors without leaking details or retrying', async () => {
		jest.mocked(getSettingsSnapshot).mockRejectedValue(new Error('private details'));
		expect(await readEmailVerificationStatus()).toEqual({ status: 'error' });
		expect(getSettingsSnapshot).toHaveBeenCalledTimes(1);
		expect(sendOwnVerificationEmail).not.toHaveBeenCalled();
	});
});

describe('Telegram Actions', () => {
	it('has no module side effects', () => {
		expect(linkOwnTelegram).not.toHaveBeenCalled();
		expect(unlinkOwnTelegram).not.toHaveBeenCalled();
		expect(unlinkTelegram.length).toBe(0);
	});
	it('forwards only the link payload to server composition', async () => {
		const payload = { id: 123, first_name: ' Test ', auth_date: 1800000000, hash: 'a'.repeat(64) };
		jest.mocked(linkOwnTelegram).mockResolvedValue({ status: 'success', telegramUsername: null });
		expect(await linkTelegram(payload)).toEqual({ status: 'success', telegramUsername: null });
		expect(linkOwnTelegram).toHaveBeenCalledTimes(1);
		expect(linkOwnTelegram).toHaveBeenCalledWith(payload);
	});
	it('never forwards client arguments to unlink', async () => {
		jest.mocked(unlinkOwnTelegram).mockResolvedValue({ status: 'success', telegramUsername: null });
		const invoke: (input: unknown) => ReturnType<typeof unlinkTelegram> = unlinkTelegram;
		expect(await invoke({ userId: 'other', accessToken: 'forged' })).toEqual({
			status: 'success',
			telegramUsername: null,
		});
		expect(unlinkOwnTelegram).toHaveBeenCalledTimes(1);
		expect(unlinkOwnTelegram).toHaveBeenCalledWith();
	});
	it.each([
		'validation-error',
		'unauthenticated',
		'refresh-required',
		'invalid-telegram-data',
		'outdated-telegram-data',
		'already-linked',
		'linked-to-another-user',
		'not-linked',
		'unlink-forbidden',
		'forbidden',
		'not-found',
		'identity-mismatch',
		'error',
	] as const)('preserves safe %s result', async (status) => {
		jest.mocked(linkOwnTelegram).mockResolvedValue({ status });
		jest.mocked(unlinkOwnTelegram).mockResolvedValue({ status });
		expect(await linkTelegram({})).toEqual({ status });
		expect(await unlinkTelegram()).toEqual({ status });
		expect(sendOwnVerificationEmail).not.toHaveBeenCalled();
		expect(getSettingsSnapshot).not.toHaveBeenCalled();
	});
	it('handles unexpected exceptions without exposing details', async () => {
		jest.mocked(linkOwnTelegram).mockRejectedValue(new Error('private details'));
		jest.mocked(unlinkOwnTelegram).mockRejectedValue(new Error('private details'));
		expect(await linkTelegram({})).toEqual({ status: 'error' });
		expect(await unlinkTelegram()).toEqual({ status: 'error' });
	});
});

describe('password change Action', () => {
	it('has no import side effects', () => {
		expect(changeOwnPassword).not.toHaveBeenCalled();
	});
	it.each([
		{ status: 'success' },
		{ status: 'validation-error' },
		{ status: 'unauthenticated' },
		{ status: 'refresh-required' },
		{ status: 'forbidden' },
		{ status: 'not-found' },
		{ status: 'error' },
		{ status: 'incomplete', stage: 'backend-result-unverified' },
		{ status: 'incomplete', stage: 'session-update-failed' },
		{ status: 'incomplete', stage: 'deadline-expired' },
		{ status: 'outcome-unknown' },
	] as const)('preserves safe result %#', async (result) => {
		const input = { password: 'NewPassword123!', passwordConfirm: 'NewPassword123!' };
		jest.mocked(changeOwnPassword).mockResolvedValue(result);
		expect(await changePassword(input)).toEqual(result);
		expect(changeOwnPassword).toHaveBeenCalledTimes(1);
		expect(changeOwnPassword).toHaveBeenCalledWith(input);
		expect(getSettingsSnapshot).not.toHaveBeenCalled();
		expect(sendOwnVerificationEmail).not.toHaveBeenCalled();
	});
	it('does not expose unexpected server error details', async () => {
		jest.mocked(changeOwnPassword).mockRejectedValue(new Error('private details'));
		expect(await changePassword({})).toEqual({ status: 'error' });
	});
});

describe('selectSettingsProfile navigation and invalidation', () => {
	const id = '11111111-1111-4111-8111-111111111111';
	beforeEach(() => {
		const backendValue1 = {
			status: 'success',
			profileId: id,
			specializationId: 11,
			changed: true,
		} as const;
		jest.mocked(selectOwnSettingsProfile).mockResolvedValue(backendValue1);
		const backendValue2 = {
			id: 11,
			slug: 'react-frontend-developer',
			title: 'React',
			description: '',
		} as const;
		jest.mocked(getSpecializationById).mockResolvedValue(backendValue2);
		jest.mocked(getLocale).mockResolvedValue('ru');
	});
	it('returns a locale-neutral route and invalidates only current-locale profile pages', async () => {
		expect(await selectSettingsProfile(id)).toEqual({
			status: 'success',
			href: '/questions/react-frontend-developer',
		});
		expect(selectOwnSettingsProfile).toHaveBeenCalledWith(id);
		expect(selectOwnSettingsProfile).toHaveBeenCalledTimes(1);
		expect(getSpecializationById).toHaveBeenCalledWith(11);
		expect(jest.mocked(revalidatePath).mock.calls).toEqual([
			['/ru/profile'],
			['/ru/profile/edit'],
			['/ru/settings'],
		]);
	});
	it('does not invalidate or fetch locale for an already-active selection', async () => {
		const backendValue3 = {
			status: 'success',
			profileId: id,
			specializationId: 11,
			changed: false,
		} as const;
		jest.mocked(selectOwnSettingsProfile).mockResolvedValue(backendValue3);
		expect(await selectSettingsProfile(id)).toEqual({
			status: 'success',
			href: '/questions/react-frontend-developer',
		});
		expect(revalidatePath).not.toHaveBeenCalled();
		expect(getLocale).not.toHaveBeenCalled();
	});
	it('routes empty specialization to edit without lookup', async () => {
		const backendValue4 = {
			status: 'success',
			profileId: id,
			specializationId: 0,
			changed: true,
		} as const;
		jest.mocked(selectOwnSettingsProfile).mockResolvedValue(backendValue4);
		expect(await selectSettingsProfile(id)).toEqual({ status: 'success', href: '/profile/edit' });
		expect(getSpecializationById).not.toHaveBeenCalled();
	});
	it.each([
		undefined,
		'',
		'../other',
		'..',
		'/evil',
		'//evil',
		'react?x=1',
		'react#x',
		'react%2Fother',
		'https://evil.invalid',
		'react\\other',
		'react\n',
	])('rejects absent or unsafe slug %#', async (slug) => {
		const backendValue5 = {
			id: 11,
			title: 'Must not slugify',
			description: '',
			slug: slug as string,
		} as const;
		jest.mocked(getSpecializationById).mockResolvedValue(backendValue5);
		expect(await selectSettingsProfile(id)).toEqual({ status: 'navigation-unavailable' });
		expect(selectOwnSettingsProfile).toHaveBeenCalledTimes(1);
		expect(revalidatePath).toHaveBeenCalledTimes(3);
	});
	it('does not use a specialization with a different ID', async () => {
		const backendValue6 = {
			id: 12,
			slug: 'java-backend-developer',
			title: 'Java',
			description: '',
		} as const;
		jest.mocked(getSpecializationById).mockResolvedValue(backendValue6);
		expect(await selectSettingsProfile(id)).toEqual({ status: 'navigation-unavailable' });
	});
	it('handles specialization API failure without repeating mutation', async () => {
		jest.mocked(getSpecializationById).mockRejectedValue(new Error('private details'));
		expect(await selectSettingsProfile(id)).toEqual({ status: 'navigation-unavailable' });
		expect(selectOwnSettingsProfile).toHaveBeenCalledTimes(1);
	});
	it.each([
		'unauthenticated',
		'refresh-required',
		'forbidden',
		'not-found',
		'incomplete',
		'outcome-unknown',
		'error',
	] as const)('preserves %s without lookup or cache writes', async (status) => {
		const backendValue7 = { status } as const;
		jest.mocked(selectOwnSettingsProfile).mockResolvedValue(backendValue7);
		expect(await selectSettingsProfile(id)).toEqual({ status });
		expect(getSpecializationById).not.toHaveBeenCalled();
		expect(revalidatePath).not.toHaveBeenCalled();
	});
	it('handles unexpected boundary failure without exposing details', async () => {
		jest.mocked(selectOwnSettingsProfile).mockRejectedValue(new Error('private details'));
		expect(await selectSettingsProfile(id)).toEqual({ status: 'error' });
	});
	it('does not accept client specialization or redirect arguments', async () => {
		const invoke: (profileId: string, extra: unknown) => ReturnType<typeof selectSettingsProfile> =
			selectSettingsProfile;
		expect(
			await invoke(id, {
				userId: 'other',
				specializationId: 999,
				slug: 'evil',
				redirectUrl: 'https://evil.invalid',
			}),
		).toEqual({ status: 'success', href: '/questions/react-frontend-developer' });
		expect(selectOwnSettingsProfile).toHaveBeenCalledWith(id);
		expect(getSpecializationById).toHaveBeenCalledWith(11);
	});
	it('does not report success if cache invalidation fails', async () => {
		jest.mocked(revalidatePath).mockImplementationOnce(() => {
			throw new Error('private details');
		});
		expect(await selectSettingsProfile(id)).toEqual({ status: 'error' });
		expect(selectOwnSettingsProfile).toHaveBeenCalledTimes(1);
	});
});

describe('createSettingsProfile', () => {
	it('is explicit, has no client arguments and no import side effects', () => {
		expect(createSettingsProfile).toHaveLength(0);
		expect(createOwnSettingsProfile).not.toHaveBeenCalled();
	});
	it('returns the internal edit target and invalidates exactly three localized pages', async () => {
		jest.mocked(getLocale).mockResolvedValue('ru');
		jest
			.mocked(createOwnSettingsProfile)
			.mockResolvedValue({ status: 'success', profileId: 'private-profile-id' });
		expect(
			await Reflect.apply(createSettingsProfile, undefined, [
				{ userId: 'foreign', specializationId: 9 },
			]),
		).toEqual({ status: 'success', href: '/profile/edit' });
		expect(createOwnSettingsProfile).toHaveBeenCalledTimes(1);
		expect(createOwnSettingsProfile).toHaveBeenCalledWith();
		expect(jest.mocked(revalidatePath).mock.calls).toEqual([
			['/ru/profile'],
			['/ru/profile/edit'],
			['/ru/settings'],
		]);
	});
	it.each([
		'unauthenticated',
		'refresh-required',
		'limit-reached',
		'unfinished-profile-exists',
		'forbidden',
		'incomplete',
		'outcome-unknown',
		'error',
	] as const)('forwards %s without cache invalidation or retry', async (status) => {
		jest.mocked(getLocale).mockResolvedValue('ru');
		jest.mocked(createOwnSettingsProfile).mockResolvedValue({ status });
		expect(await createSettingsProfile()).toEqual({ status });
		expect(createOwnSettingsProfile).toHaveBeenCalledTimes(1);
		expect(revalidatePath).not.toHaveBeenCalled();
	});
	it('rejects an invalid locale before creation', async () => {
		jest.mocked(getLocale).mockResolvedValue('invalid');
		expect(await createSettingsProfile()).toEqual({ status: 'error' });
		expect(createOwnSettingsProfile).not.toHaveBeenCalled();
	});
	it('does not expose an unexpected exception', async () => {
		jest.mocked(getLocale).mockResolvedValue('ru');
		jest.mocked(createOwnSettingsProfile).mockRejectedValue(new Error('Private'));
		expect(await createSettingsProfile()).toEqual({ status: 'error' });
	});
	it('reports incomplete if confirmed creation cannot invalidate its server views', async () => {
		jest.mocked(getLocale).mockResolvedValue('ru');
		jest
			.mocked(createOwnSettingsProfile)
			.mockResolvedValue({ status: 'success', profileId: 'new-profile' });
		jest.mocked(revalidatePath).mockImplementationOnce(() => {
			throw new Error('Private');
		});
		expect(await createSettingsProfile()).toEqual({ status: 'incomplete' });
		expect(createOwnSettingsProfile).toHaveBeenCalledTimes(1);
	});
});

describe('deleteSettingsProfile', () => {
	const id = '11111111-1111-4111-8111-111111111111';
	it('has no import side effects and only forwards the string UUID and confirmation', async () => {
		expect(deleteOwnSettingsProfile).not.toHaveBeenCalled();
		expect(deleteSettingsProfile).toHaveLength(2);
		jest.mocked(getLocale).mockResolvedValue('ru');
		jest.mocked(deleteOwnSettingsProfile).mockResolvedValue({ status: 'success' });
		expect(
			await Reflect.apply(deleteSettingsProfile, undefined, [
				id,
				' Name ',
				{ userId: 'foreign', activeProfileId: 'foreign' },
			]),
		).toEqual({ status: 'success' });
		expect(deleteOwnSettingsProfile).toHaveBeenCalledWith(id, ' Name ');
		expect(deleteOwnSettingsProfile).toHaveBeenCalledTimes(1);
		expect(jest.mocked(revalidatePath).mock.calls).toEqual([
			['/ru/profile'],
			['/ru/profile/edit'],
			['/ru/settings'],
		]);
	});
	it.each([
		'unauthenticated',
		'refresh-required',
		'invalid-input',
		'confirmation-mismatch',
		'forbidden',
		'last-profile',
		'active-profile',
		'incomplete',
		'outcome-unknown',
		'error',
	] as const)('forwards %s without cache invalidation or retry', async (status) => {
		jest.mocked(getLocale).mockResolvedValue('ru');
		jest.mocked(deleteOwnSettingsProfile).mockResolvedValue({ status });
		expect(await deleteSettingsProfile(id, ' Name ')).toEqual({ status });
		expect(deleteOwnSettingsProfile).toHaveBeenCalledTimes(1);
		expect(revalidatePath).not.toHaveBeenCalled();
	});
	it('hides unexpected exceptions', async () => {
		jest.mocked(getLocale).mockResolvedValue('ru');
		jest.mocked(deleteOwnSettingsProfile).mockRejectedValue(new Error('Private details'));
		expect(await deleteSettingsProfile(id, ' Name ')).toEqual({ status: 'error' });
	});
	it('does not start deletion with unsupported locale', async () => {
		jest.mocked(getLocale).mockResolvedValue('invalid');
		expect(await deleteSettingsProfile(id, ' Name ')).toEqual({ status: 'error' });
		expect(deleteOwnSettingsProfile).not.toHaveBeenCalled();
	});
	it('reports incomplete if invalidation fails after confirmed deletion', async () => {
		jest.mocked(getLocale).mockResolvedValue('ru');
		jest.mocked(deleteOwnSettingsProfile).mockResolvedValue({ status: 'success' });
		jest.mocked(revalidatePath).mockImplementationOnce(() => {
			throw new Error('Private');
		});
		expect(await deleteSettingsProfile(id, ' Name ')).toEqual({ status: 'incomplete' });
		expect(deleteOwnSettingsProfile).toHaveBeenCalledTimes(1);
	});
});

describe('deleteSettingsAccount', () => {
	it('is explicit and forwards only the confirmation, never client identity', async () => {
		expect(deleteOwnSettingsAccount).not.toHaveBeenCalled();
		expect(deleteSettingsAccount).toHaveLength(1);
		jest.mocked(deleteOwnSettingsAccount).mockResolvedValue({ status: 'success' });
		expect(
			await Reflect.apply(deleteSettingsAccount, undefined, [' Name ', { userId: 'foreign' }]),
		).toEqual({ status: 'success' });
		expect(deleteOwnSettingsAccount).toHaveBeenCalledWith(' Name ');
		expect(deleteOwnSettingsAccount).toHaveBeenCalledTimes(1);
		expect(revalidatePath).not.toHaveBeenCalled();
		expect(getSpecializationById).not.toHaveBeenCalled();
	});
	it.each([
		'unauthenticated',
		'refresh-required',
		'invalid-input',
		'confirmation-mismatch',
		'forbidden',
		'outcome-unknown',
		'error',
	] as const)('preserves %s without retry', async (status) => {
		jest.mocked(deleteOwnSettingsAccount).mockResolvedValue({ status });
		expect(await deleteSettingsAccount(' Name ')).toEqual({ status });
		expect(deleteOwnSettingsAccount).toHaveBeenCalledTimes(1);
	});
	it('does not reveal unexpected server exceptions', async () => {
		jest.mocked(deleteOwnSettingsAccount).mockRejectedValue(new Error('Private details'));
		expect(await deleteSettingsAccount(' Name ')).toEqual({ status: 'error' });
	});
});

describe('readSettingsPaymentHistory', () => {
	it('has no import side effects and forwards only the page argument', async () => {
		expect(getSettingsPaymentHistory).not.toHaveBeenCalled();
		jest
			.mocked(getSettingsPaymentHistory)
			.mockResolvedValue({ status: 'success', items: [], page: 2, limit: 5, total: 0 });
		expect(
			await Reflect.apply(readSettingsPaymentHistory, null, [
				2,
				{ userId: 'foreign', limit: 100, accessToken: 'foreign' },
			]),
		).toEqual({ status: 'success', items: [], page: 2, limit: 5, total: 0 });
		expect(getSettingsPaymentHistory).toHaveBeenCalledTimes(1);
		expect(getSettingsPaymentHistory).toHaveBeenCalledWith(2);
		expect(getSettingsSnapshot).not.toHaveBeenCalled();
		expect(revalidatePath).not.toHaveBeenCalled();
	});
	it.each(['invalid-input', 'unauthenticated', 'refresh-required', 'forbidden', 'error'] as const)(
		'preserves safe %s result',
		async (status) => {
			jest.mocked(getSettingsPaymentHistory).mockResolvedValue({ status });
			expect(await readSettingsPaymentHistory(1)).toEqual({ status });
		},
	);
	it('does not expose thrown server error details', async () => {
		jest.mocked(getSettingsPaymentHistory).mockRejectedValue(new Error('Private backend'));
		expect(await readSettingsPaymentHistory(1)).toEqual({ status: 'error' });
	});
});

describe('startSettingsTrial', () => {
	it('accepts no arguments, delegates once and invalidates only locale Settings/profile views after success', async () => {
		expect(startOwnSettingsTrial).not.toHaveBeenCalled();
		expect(startSettingsTrial.length).toBe(0);
		jest.mocked(startOwnSettingsTrial).mockResolvedValue({ status: 'success' });
		expect(
			await Reflect.apply(startSettingsTrial, null, [
				{ userId: 'foreign', duration: 999, url: 'https://foreign' },
			]),
		).toEqual({ status: 'success' });
		expect(startOwnSettingsTrial).toHaveBeenCalledTimes(1);
		expect(startOwnSettingsTrial).toHaveBeenCalledWith();
		expect(jest.mocked(revalidatePath).mock.calls).toEqual([
			['/ru/settings'],
			['/ru/profile'],
			['/ru/profile/edit'],
		]);
	});
	it.each([
		'unauthenticated',
		'refresh-required',
		'verification-required',
		'not-eligible',
		'forbidden',
		'conflict',
		'incomplete',
		'outcome-unknown',
		'error',
	] as const)('preserves %s without invalidation or repeat', async (status) => {
		jest.mocked(startOwnSettingsTrial).mockResolvedValue({ status });
		expect(await startSettingsTrial()).toEqual({ status });
		expect(startOwnSettingsTrial).toHaveBeenCalledTimes(1);
		expect(revalidatePath).not.toHaveBeenCalled();
	});
	it('treats an unexpected composition failure as unknown without repeating', async () => {
		jest.mocked(startOwnSettingsTrial).mockRejectedValue(new Error('Private failure'));
		expect(await startSettingsTrial()).toEqual({ status: 'outcome-unknown' });
		expect(startOwnSettingsTrial).toHaveBeenCalledTimes(1);
		expect(revalidatePath).not.toHaveBeenCalled();
	});
	it('does not replay a confirmed mutation if cache invalidation fails', async () => {
		jest.mocked(startOwnSettingsTrial).mockResolvedValue({ status: 'success' });
		jest.mocked(revalidatePath).mockImplementationOnce(() => {
			throw new Error('Cache failure');
		});
		expect(await startSettingsTrial()).toEqual({ status: 'incomplete' });
		expect(startOwnSettingsTrial).toHaveBeenCalledTimes(1);
	});
});

const paymentInput = {
	tariffId: 2,
	email: 'synthetic@example.invalid',
	isOfferAgreed: true,
	isConsentAgreed: true,
};
it('does not initialize payment at import', () => {
	expect(initializeOwnSettingsPayment).not.toHaveBeenCalled();
});
it.each([
	'success',
	'invalid-input',
	'unauthenticated',
	'refresh-required',
	'verification-required',
	'not-available',
	'forbidden',
	'conflict',
	'outcome-unknown',
	'error',
] as const)('passes safe payment result %s without replay or session changes', async (status) => {
	const result =
		status === 'success'
			? { status, paymentUrl: 'https://securepay.tinkoff.ru/new/synthetic' }
			: { status };
	jest.mocked(initializeOwnSettingsPayment).mockResolvedValue(result);
	expect(await initializeSettingsPayment(paymentInput)).toEqual(result);
	expect(initializeOwnSettingsPayment).toHaveBeenCalledTimes(1);
	expect(initializeOwnSettingsPayment).toHaveBeenCalledWith(paymentInput);
	expect(startOwnSettingsTrial).not.toHaveBeenCalled();
	expect(revalidatePath).not.toHaveBeenCalled();
});
it('keeps an unexpected payment composition exception unknown without replay', async () => {
	jest.mocked(initializeOwnSettingsPayment).mockRejectedValue(new Error('Private failure'));
	expect(await initializeSettingsPayment(paymentInput)).toEqual({ status: 'outcome-unknown' });
	expect(initializeOwnSettingsPayment).toHaveBeenCalledTimes(1);
});

describe('cancel subscription Action', () => {
	const id = '22222222-2222-4222-8222-222222222222';
	const success = {
		status: 'success' as const,
		subscription: {
			state: 'canceled' as const,
			daysLeft: 7,
			daysInCreationMonth: 28,
			endDateLabel: '1 февраля 2030',
		},
	};
	beforeEach(() => {
		jest.mocked(getLocale).mockResolvedValue('ru');
	});
	it('does not call cancellation at import', () =>
		expect(cancelOwnSettingsSubscription).not.toHaveBeenCalled());
	it('returns confirmed projection and invalidates only locale-specific Settings and profile paths', async () => {
		jest.mocked(cancelOwnSettingsSubscription).mockResolvedValue(success);
		expect(await cancelSettingsSubscription(id)).toEqual(success);
		expect(cancelOwnSettingsSubscription).toHaveBeenCalledTimes(1);
		expect(cancelOwnSettingsSubscription).toHaveBeenCalledWith(id);
		expect(jest.mocked(revalidatePath).mock.calls.map(([path]) => path)).toEqual([
			'/ru/settings',
			'/ru/profile',
			'/ru/profile/edit',
		]);
		expect(startOwnSettingsTrial).not.toHaveBeenCalled();
		expect(initializeOwnSettingsPayment).not.toHaveBeenCalled();
	});
	it.each([
		'invalid-input',
		'unauthenticated',
		'refresh-required',
		'verification-required',
		'not-available',
		'forbidden',
		'conflict',
		'incomplete',
		'outcome-unknown',
		'error',
	] as const)('preserves %s without revalidation or replay', async (status) => {
		jest.mocked(cancelOwnSettingsSubscription).mockResolvedValue({ status });
		expect(await cancelSettingsSubscription(id)).toEqual({ status });
		expect(cancelOwnSettingsSubscription).toHaveBeenCalledTimes(1);
		expect(revalidatePath).not.toHaveBeenCalled();
	});
	it('keeps an unexpected composition exception unknown without replay', async () => {
		jest.mocked(cancelOwnSettingsSubscription).mockRejectedValue(new Error('Private failure'));
		expect(await cancelSettingsSubscription(id)).toEqual({ status: 'outcome-unknown' });
		expect(cancelOwnSettingsSubscription).toHaveBeenCalledTimes(1);
	});
	it('does not replay when cache invalidation fails after confirmed cancellation', async () => {
		jest.mocked(cancelOwnSettingsSubscription).mockResolvedValue(success);
		jest.mocked(revalidatePath).mockImplementationOnce(() => {
			throw new Error('Cache failure');
		});
		expect(await cancelSettingsSubscription(id)).toEqual({ status: 'incomplete' });
		expect(cancelOwnSettingsSubscription).toHaveBeenCalledTimes(1);
	});
	it('rejects unsupported locale before the composition', async () => {
		jest.mocked(getLocale).mockResolvedValue('unsupported');
		expect(await cancelSettingsSubscription(id)).toEqual({ status: 'error' });
		expect(cancelOwnSettingsSubscription).not.toHaveBeenCalled();
	});
});
