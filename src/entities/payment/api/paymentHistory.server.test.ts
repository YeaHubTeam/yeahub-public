/** @jest-environment node */
import { readPaymentHistory } from './paymentHistory.server';

jest.mock('server-only', () => ({}), { virtual: true });
const credentials = {
	userId: '11111111-1111-4111-8111-111111111111',
	accessToken: 'synthetic-access',
};
const config = {
	apiOrigin: 'https://backend.example',
	allowedOrigins: ['https://backend.example'],
};
const payment = (status: string | null = 'CONFIRMED') => ({
	createdAt: '2026-02-01T00:00:00.000Z',
	status,
	orderId: 'private-order',
	paymentId: 'private-payment',
	rebillId: 'private-rebill',
	amount: 900,
	purpose: 'subscription',
	fulfilledAt: null,
	closedAt: null,
});
const body = (data: unknown[] = [payment()], page = 1, total = data.length) => ({
	data,
	page,
	limit: 5,
	total,
});
let request: jest.SpyInstance;
beforeEach(() => {
	request = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Private network failure'));
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
});
const reply = (value: unknown, status = 200) =>
	request.mockResolvedValue(new Response(JSON.stringify(value), { status }));
const read = (page: unknown = 1) => readPaymentHistory(page, credentials, config);
it('has no import side effects and sends one private GET with fixed limit and trusted identity', async () => {
	expect(request).not.toHaveBeenCalled();
	reply(body());
	expect(await read()).toEqual({
		status: 'success',
		items: [{ dateLabel: '1 февраля 2026', isConfirmed: true }],
		page: 1,
		limit: 5,
		total: 1,
	});
	expect(request).toHaveBeenCalledTimes(1);
	const [url, options] = request.mock.calls[0];
	expect(url.origin).toBe(config.apiOrigin);
	expect(url.pathname).toBe(`/payments/${credentials.userId}`);
	expect(Object.fromEntries(url.searchParams)).toEqual({ page: '1', limit: '5' });
	expect(options).toMatchObject({
		method: 'GET',
		cache: 'no-store',
		credentials: 'omit',
		redirect: 'manual',
	});
	expect([...new Headers(options.headers).entries()]).toEqual([
		['authorization', 'Bearer synthetic-access'],
	]);
	expect(options.body).toBeUndefined();
});
it.each([undefined, null, 0, -1, 1.5, '1', true, {}, [], Infinity, NaN, Number.MAX_SAFE_INTEGER])(
	'rejects invalid page %# before HTTP',
	async (page) => {
		expect(await readPaymentHistory(page, credentials, config)).toEqual({
			status: 'invalid-input',
		});
		expect(request).not.toHaveBeenCalled();
	},
);
it.each(['user-id', '', '../other', '11111111-1111-4111-8111-11111111111'])(
	'rejects invalid server identity %s',
	async (userId) => {
		expect(await readPaymentHistory(1, { ...credentials, userId }, config)).toEqual({
			status: 'unauthenticated',
		});
		expect(request).not.toHaveBeenCalled();
	},
);
it('rejects unsafe token or untrusted origin without HTTP', async () => {
	expect(
		await readPaymentHistory(1, { ...credentials, accessToken: 'unsafe\nheader' }, config),
	).toEqual({ status: 'unauthenticated' });
	expect(await readPaymentHistory(1, credentials, { ...config, allowedOrigins: [] })).toEqual({
		status: 'error',
	});
	expect(request).not.toHaveBeenCalled();
});
it.each([
	{ page: 1, total: 0, data: [] },
	{ page: 1, total: 6, data: Array.from({ length: 5 }, () => payment()) },
	{ page: 2, total: 6, data: [payment()] },
	{ page: 3, total: 6, data: [] },
])(
	'accepts empty, paginated and out-of-range page $page / $total',
	async ({ page, total, data }) => {
		reply(body(data, page, total));
		expect(await read(page)).toMatchObject({
			status: 'success',
			page,
			limit: 5,
			total,
			items: data.map(() => ({ dateLabel: '1 февраля 2026', isConfirmed: true })),
		});
		expect(request).toHaveBeenCalledTimes(1);
		expect(request.mock.calls[0][0].search).toBe(`?page=${page}&limit=5`);
	},
);
it.each([
	'CONFIRMED',
	'AUTHORIZED',
	'REJECTED',
	'AUTH_FAIL',
	'DEADLINE_EXPIRED',
	'CANCELED',
	'UNKNOWN',
	'',
	null,
])('uses only exact CONFIRMED for status %s', async (status) => {
	reply(body([payment(status)]));
	expect(await read()).toMatchObject({
		status: 'success',
		items: [{ isConfirmed: status === 'CONFIRMED' }],
	});
});
it('does not filter purposes or expose IDs, financial fields, credentials or full DTOs', async () => {
	reply(
		body(
			['subscription', 'token_package', null].map((purpose) => ({
				...payment(null),
				purpose,
				accessToken: 'private-access',
				refreshToken: 'private-refresh',
			})),
		),
	);
	const result = await read();
	expect(result).toEqual({
		status: 'success',
		page: 1,
		limit: 5,
		total: 3,
		items: Array.from({ length: 3 }, () => ({ dateLabel: '1 февраля 2026', isConfirmed: false })),
	});
	expect(JSON.stringify(result)).not.toMatch(
		/private|orderId|paymentId|rebillId|amount|purpose|Token/,
	);
});
it.each(
	[
		null,
		{},
		[],
		{ ...body(), data: {} },
		{ ...body(), page: 2 },
		{ ...body(), page: '1' },
		{ ...body(), limit: 10 },
		{ ...body(), total: -1 },
		{ ...body(), total: 1.5 },
		{ ...body(), total: '1' },
		{ ...body(), total: 0 },
		{ ...body(), total: 6 },
		body([null]),
		body([{}]),
		...[
			undefined,
			null,
			'',
			0,
			{},
			'2026-02-01',
			'invalid',
			'2026-02-30T00:00:00Z',
			'2025-02-29T00:00:00Z',
			'2026-01-01T24:00:00Z',
		].map((createdAt) => body([{ ...payment(), createdAt }])),
		...[undefined, 42, [], {}].map((status) => body([{ ...payment(), status }])),
	].map((value) => ({ value })),
)('rejects malformed response %# rather than returning an empty success', async ({ value }) => {
	reply(value);
	expect(await read()).toEqual({ status: 'error' });
	expect(request).toHaveBeenCalledTimes(1);
});
it.each([
	[400, 'error'],
	[401, 'unauthenticated'],
	[403, 'forbidden'],
	[404, 'error'],
	[500, 'error'],
	[302, 'error'],
] as const)('maps HTTP %s to %s without retries', async (status, expected) => {
	reply({}, status);
	expect(await read()).toEqual({ status: expected });
	expect(request).toHaveBeenCalledTimes(1);
});
it('handles network and invalid JSON with safe errors', async () => {
	expect(await read()).toEqual({ status: 'error' });
	request.mockResolvedValue(new Response('invalid'));
	expect(await read()).toEqual({ status: 'error' });
	expect(request).toHaveBeenCalledTimes(2);
});
it('aborts a hanging request at five seconds without retrying', async () => {
	jest.useFakeTimers();
	request.mockImplementation(() => new Promise(() => {}));
	const result = read();
	const signal = request.mock.calls[0][1].signal;
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'error' });
	expect(signal.aborted).toBe(true);
	expect(request).toHaveBeenCalledTimes(1);
});
it('formats offsets and leap days in the fixed UTC test process timezone', async () => {
	reply(body([{ ...payment(), createdAt: '2024-03-01T01:00:00+03:00' }]));
	expect(await read()).toMatchObject({
		status: 'success',
		items: [{ dateLabel: '29 февраля 2024' }],
	});
});

it('keeps the five-second deadline while decoding the body and ignores late completion', async () => {
	jest.useFakeTimers();
	let resolve!: (value: unknown) => void;
	const response = new Response('{}');
	const json = jest.spyOn(response, 'json').mockImplementation(
		() =>
			new Promise((done) => {
				resolve = done;
			}),
	);
	request.mockResolvedValue(response);
	const pending = read();
	await Promise.resolve();
	expect(json).toHaveBeenCalledTimes(1);
	expect(jest.getTimerCount()).toBe(1);
	await jest.advanceTimersByTimeAsync(5000);
	expect(await pending).toEqual({ status: 'error' });
	expect(request.mock.calls[0][1].signal.aborted).toBe(true);
	expect(jest.getTimerCount()).toBe(0);
	resolve(body());
	await Promise.resolve();
	expect(request).toHaveBeenCalledTimes(1);
});
it.each([201, 204, 409, 429, 502, 503])(
	'keeps HTTP %i as an error without decoding or auth recovery',
	async (status) => {
		const response = new Response(null, { status });
		const json = jest.spyOn(response, 'json');
		request.mockResolvedValue(response);
		expect(await read()).toEqual({ status: 'error' });
		expect(json).not.toHaveBeenCalled();
		expect(request).toHaveBeenCalledTimes(1);
		expect(request.mock.calls[0][0].pathname).toBe(`/payments/${credentials.userId}`);
	},
);
