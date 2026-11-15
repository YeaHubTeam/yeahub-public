/** @jest-environment node */
import * as transport from '@/shared/api/index.server';

import { parsePaymentInitInput, requestPaymentInit } from './paymentInit.server';

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/shared/api/index.server', () => {
	const actual = jest.requireActual('@/shared/api/index.server');
	return { ...actual, backendHttp: jest.fn(actual.backendHttp) };
});
const input = {
	tariffId: 2,
	email: 'receipt+tag@example.invalid',
	isOfferAgreed: true,
	isConsentAgreed: true,
};
const credentials = { accessToken: 'synthetic-access' };
const config = {
	apiOrigin: 'https://backend.example',
	allowedOrigins: ['https://backend.example'],
};
const paymentUrl = 'https://securepay.tinkoff.ru/new/synthetic';
let request: jest.SpyInstance;
beforeEach(() => {
	request = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Private failure'));
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
});
it('imports without dispatch and returns only a trusted link after one explicit GET', async () => {
	expect(request).not.toHaveBeenCalled();
	request.mockResolvedValue(new Response(paymentUrl));
	expect(await requestPaymentInit(input, credentials, config)).toEqual({
		status: 'success',
		paymentUrl,
	});
	expect(request).toHaveBeenCalledTimes(1);
	const [url, options] = request.mock.calls[0];
	expect(url.pathname).toBe('/subscriptions/2/payment/init');
	expect(url.search).toBe('?email=receipt%2Btag%40example.invalid');
	expect([...url.searchParams.keys()]).toEqual(['email']);
	expect(options).toMatchObject({
		method: 'GET',
		cache: 'no-store',
		redirect: 'manual',
		credentials: 'omit',
		headers: new Headers({ Authorization: 'Bearer synthetic-access' }),
	});
	expect(options.body).toBeUndefined();
});
it.each([
	null,
	[],
	{},
	{ ...input, tariffId: '2' },
	{ ...input, tariffId: 0 },
	{ ...input, tariffId: -1 },
	{ ...input, tariffId: 1.5 },
	{ ...input, tariffId: NaN },
	{ ...input, tariffId: Infinity },
	{ ...input, email: '' },
	{ ...input, email: 'a@b' },
	{ ...input, email: ' A@example.invalid' },
	{ ...input, email: 'Юзер@example.invalid' },
	{ ...input, email: 1 },
	{ ...input, isOfferAgreed: false },
	{ ...input, isConsentAgreed: false },
	{ ...input, isOfferAgreed: 'true' },
	{ ...input, userId: 'other' },
	{ ...input, accessToken: 'other' },
])('rejects invalid or extra client fields before dispatch %#', async (value) => {
	expect(parsePaymentInitInput(value)).toBeNull();
	expect(await requestPaymentInit(value as typeof input, credentials, config)).toEqual({
		status: 'invalid-input',
	});
	expect(request).not.toHaveBeenCalled();
});
it.each(['first.last+tag@example.invalid', 'a_b%tag@sub.example.invalid'])(
	'preserves a valid React email %s',
	(email) => {
		expect(parsePaymentInitInput({ ...input, email })?.email).toBe(email);
	},
);
it.each([
	[400, 'error'],
	[401, 'unauthenticated'],
	[403, 'forbidden'],
	[404, 'not-available'],
	[409, 'conflict'],
	[500, 'outcome-unknown'],
	[503, 'outcome-unknown'],
	[302, 'outcome-unknown'],
	[204, 'outcome-unknown'],
] as const)('maps HTTP %s without retry', async (status, expected) => {
	request.mockResolvedValue(new Response(null, { status }));
	expect(await requestPaymentInit(input, credentials, config)).toEqual({ status: expected });
	expect(request).toHaveBeenCalledTimes(1);
});
it('recognizes verified-email denial without leaking private response fields', async () => {
	request.mockResolvedValue(
		new Response(JSON.stringify({ message: 'auth.user.verified', private: 'hidden' }), {
			status: 403,
		}),
	);
	expect(await requestPaymentInit(input, credentials, config)).toEqual({
		status: 'verification-required',
	});
});
it.each([
	'',
	'not a URL',
	JSON.stringify(paymentUrl),
	'{}',
	'http://securepay.tinkoff.ru/new/a',
	'//securepay.tinkoff.ru/new/a',
	'javascript:alert(1)',
	'data:text/html,test',
	'https://securepay.tinkoff.ru.evil.invalid/a',
	'https://evilsecurepay.tinkoff.ru/a',
	'https://securepay.tinkoff.ru@evil.invalid/a',
	'https://user@securepay.tinkoff.ru/a',
	'https://user:password@securepay.tinkoff.ru/a',
	'https://securepay.tinkoff.ru:8443/a',
	'https://securepay.tinkoff.ru./a',
	'https://securepay.tinkoff.ru\\@evil.invalid/a',
	' https://securepay.tinkoff.ru/a',
	'https://securepay.tinkoff.ru/a\n',
	'https://unknown.invalid/a',
])('treats untrusted or malformed 200 response as unknown %#', async (body) => {
	request.mockResolvedValue(new Response(body));
	expect(await requestPaymentInit(input, credentials, config)).toEqual({
		status: 'outcome-unknown',
	});
	expect(request).toHaveBeenCalledTimes(1);
});
it('accepts HTTPS standard port without fetching the returned URL', async () => {
	const url = 'https://securepay.tinkoff.ru:443/new/synthetic';
	request.mockResolvedValue(new Response(url));
	expect(await requestPaymentInit(input, credentials, config)).toEqual({
		status: 'success',
		paymentUrl: url,
	});
	expect(request).toHaveBeenCalledTimes(1);
});
it('does not retry network failure or a lost response body', async () => {
	expect(await requestPaymentInit(input, credentials, config)).toEqual({
		status: 'outcome-unknown',
	});
	expect(request).toHaveBeenCalledTimes(1);
	request.mockClear().mockResolvedValue({
		status: 200,
		text: () => Promise.reject(new Error('Private body failure')),
	});
	expect(await requestPaymentInit(input, credentials, config)).toEqual({
		status: 'outcome-unknown',
	});
	expect(request).toHaveBeenCalledTimes(1);
});
it('waits 45 seconds, aborts and never replays a hanging mutation', async () => {
	jest.useFakeTimers();
	request.mockImplementation(() => new Promise(() => {}));
	const result = requestPaymentInit(input, credentials, config);
	const signal = request.mock.calls[0][1].signal;
	await jest.advanceTimersByTimeAsync(44999);
	expect(signal.aborted).toBe(false);
	await jest.advanceTimersByTimeAsync(1);
	expect(await result).toEqual({ status: 'outcome-unknown' });
	expect(signal.aborted).toBe(true);
	expect(request).toHaveBeenCalledTimes(1);
	expect(jest.getTimerCount()).toBe(0);
});
it('bounds a hanging success body and cleans timers after a completed response', async () => {
	jest.useFakeTimers();
	request.mockResolvedValue({ status: 200, text: () => new Promise(() => {}) });
	const result = requestPaymentInit(input, credentials, config);
	await jest.advanceTimersByTimeAsync(45000);
	expect(await result).toEqual({ status: 'outcome-unknown' });
	request.mockResolvedValue(new Response(paymentUrl));
	expect(await requestPaymentInit(input, credentials, config)).toEqual({
		status: 'success',
		paymentUrl,
	});
	expect(jest.getTimerCount()).toBe(0);
});
it('rejects untrusted backend origin and unsafe credentials before dispatch', async () => {
	expect(await requestPaymentInit(input, credentials, { ...config, allowedOrigins: [] })).toEqual({
		status: 'error',
	});
	expect(await requestPaymentInit(input, { accessToken: 'unsafe\nheader' }, config)).toEqual({
		status: 'error',
	});
	expect(request).not.toHaveBeenCalled();
});

it('uses one explicit mutation transport call with the existing deadline', async () => {
	request.mockResolvedValue(new Response(paymentUrl, { status: 200 }));
	await requestPaymentInit(input, credentials, config);
	expect(transport.backendHttp).toHaveBeenCalledWith(
		expect.objectContaining({
			method: 'GET',
			effect: 'mutation',
			cache: 'no-store',
			timeoutMs: 45000,
		}),
	);
	expect(request).toHaveBeenCalledTimes(1);
	expect(new Headers(request.mock.calls[0][1].headers).has('Cookie')).toBe(false);
});
it('bounds forbidden body decoding without retry or false success', async () => {
	jest.useFakeTimers();
	request.mockResolvedValue({ status: 403, json: () => new Promise(() => {}) });
	const result = requestPaymentInit(input, credentials, config);
	await jest.advanceTimersByTimeAsync(45000);
	expect(await result).toEqual({ status: 'outcome-unknown' });
	expect(request.mock.calls[0][1].signal.aborted).toBe(true);
	expect(request).toHaveBeenCalledTimes(1);
	expect(jest.getTimerCount()).toBe(0);
});
it('keeps malformed forbidden JSON as forbidden', async () => {
	request.mockResolvedValue(new Response('not JSON', { status: 403 }));
	expect(await requestPaymentInit(input, credentials, config)).toEqual({ status: 'forbidden' });
	expect(request).toHaveBeenCalledTimes(1);
});
