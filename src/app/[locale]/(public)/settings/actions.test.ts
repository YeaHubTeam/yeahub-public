/** @jest-environment node */
import {
	getSettingsSnapshot,
	linkOwnTelegram,
	sendOwnVerificationEmail,
	unlinkOwnTelegram,
} from '@/auth';

import {
	linkTelegram,
	readEmailVerificationStatus,
	requestVerificationEmail,
	unlinkTelegram,
} from './actions';

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/auth', () => ({
	sendOwnVerificationEmail: jest.fn(),
	getSettingsSnapshot: jest.fn(),
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
