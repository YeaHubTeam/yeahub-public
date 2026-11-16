/** @jest-environment node */
import { readSettingsCatalog } from './settingsCatalog.server';

jest.mock('server-only', () => ({}), { virtual: true });
const config = {
	apiOrigin: 'https://backend.example',
	allowedOrigins: ['https://backend.example'],
};
const gate = { status: 'allowed', showTariffs: true } as const;
const tariff = (id = 1, code = 'month') => ({
	id,
	code,
	isActive: true,
	finalPrice: 501,
	pricePerMonth: 800,
	discount: 10,
	monthPeriod: 1,
	roles: ['hidden'],
	token: 'hidden',
	description: 'hidden',
});
let fetchSpy: jest.SpyInstance;
beforeEach(() => {
	fetchSpy = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Private'));
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
});
const reply = (body: unknown, status = 200) =>
	fetchSpy.mockResolvedValue(new Response(JSON.stringify(body), { status }));
it('projects only display fields in React order without recomputing backend finalPrice', async () => {
	reply([
		tariff(4, 'year'),
		tariff(2),
		tariff(3, 'quarter'),
		tariff(1, 'free'),
		tariff(5, 'trial'),
		{ ...tariff(6), isActive: false },
	]);
	const result = await readSettingsCatalog(gate, config);
	expect(result.status).toBe('success');
	if (result.status !== 'success') throw new Error('Expected catalog');
	expect(result.tariffs.map(({ code }) => code)).toEqual(['free', 'month', 'quarter', 'year']);
	expect(result.tariffs[0]).toEqual({
		id: 1,
		code: 'free',
		finalPrice: 501,
		pricePerMonth: 800,
		discount: 10,
		monthPeriod: 1,
	});
	expect(fetchSpy).toHaveBeenCalledTimes(1);
	expect(fetchSpy).toHaveBeenCalledWith(
		new URL('https://backend.example/subscriptions'),
		expect.objectContaining({ cache: 'no-store', credentials: 'omit', redirect: 'manual' }),
	);
	expect([...new Headers(fetchSpy.mock.calls[0][1].headers).entries()]).toEqual([]);
	expect(fetchSpy.mock.calls[0][1].method).toBe('GET');
});
it.each([[], [tariff(2, 'quarter')]].map((items) => ({ items })))(
	'accepts empty or partial catalogs %#',
	async ({ items }) => {
		reply(items);
		const result = await readSettingsCatalog(gate, config);
		expect(result).toMatchObject({
			status: 'success',
			tariffs: items.map(({ id, code, finalPrice, pricePerMonth, discount, monthPeriod }) => ({
				id,
				code,
				finalPrice,
				pricePerMonth,
				discount,
				monthPeriod,
			})),
		});
	},
);
it.each(['disabled', 'missing', 'role-denied', 'unavailable'] as const)(
	'does not request a catalog for %s',
	async (status) => {
		const hidden = { status, showTariffs: false } as const;
		expect(await readSettingsCatalog(hidden, config)).toEqual({ status: 'hidden', gate: hidden });
		expect(fetchSpy).not.toHaveBeenCalled();
	},
);
it.each(
	[
		null,
		{},
		[null],
		[tariff(), tariff()],
		[tariff(), tariff(2)],
		...[
			{ id: 0 },
			{ id: '1' },
			{ code: null },
			{ isActive: 'true' },
			{ finalPrice: -1 },
			{ finalPrice: null },
			{ finalPrice: 1.5 },
			{ pricePerMonth: -1 },
			{ pricePerMonth: '800' },
			{ discount: -1 },
			{ discount: 101 },
			{ discount: 0.5 },
			{ monthPeriod: 0 },
			{ monthPeriod: 1.5 },
			{ monthPeriod: undefined },
		].map((patch) => [{ ...tariff(), ...patch }]),
	].map((value) => ({ value })),
)('rejects malformed catalogs and duplicate ids/codes %#', async ({ value }) => {
	reply(value);
	expect(await readSettingsCatalog(gate, config)).toEqual({
		status: 'error',
		reason: 'invalid-response',
	});
	expect(fetchSpy).toHaveBeenCalledTimes(1);
});
it.each([400, 401, 403, 404, 500, 302])(
	'keeps backend %s distinct from successful empty data',
	async (status) => {
		reply([], status);
		expect(await readSettingsCatalog(gate, config)).toEqual({ status: 'error', reason: 'backend' });
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	},
);
it('handles network and JSON errors without retries', async () => {
	expect(await readSettingsCatalog(gate, config)).toEqual({ status: 'error', reason: 'backend' });
	fetchSpy.mockResolvedValue(new Response('invalid'));
	expect(await readSettingsCatalog(gate, config)).toEqual({
		status: 'error',
		reason: 'invalid-response',
	});
});
it('aborts at five seconds without retries', async () => {
	jest.useFakeTimers();
	fetchSpy.mockImplementation(() => new Promise(() => {}));
	const result = readSettingsCatalog(gate, config);
	const signal = fetchSpy.mock.calls[0][1].signal;
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'error', reason: 'timeout' });
	expect(signal.aborted).toBe(true);
	expect(fetchSpy).toHaveBeenCalledTimes(1);
});
it('does not fetch on import or use an untrusted origin', async () => {
	expect(fetchSpy).not.toHaveBeenCalled();
	expect(await readSettingsCatalog(gate, { ...config, allowedOrigins: [] })).toEqual({
		status: 'error',
		reason: 'backend',
	});
	expect(fetchSpy).not.toHaveBeenCalled();
});

it('keeps its deadline while reading the body and cleans up after timeout', async () => {
	jest.useFakeTimers();
	let resolve!: (value: unknown) => void;
	const response = new Response('[]');
	const json = jest.spyOn(response, 'json').mockImplementation(
		() =>
			new Promise((done) => {
				resolve = done;
			}),
	);
	fetchSpy.mockResolvedValue(response);
	const pending = readSettingsCatalog(gate, config);
	await Promise.resolve();
	expect(json).toHaveBeenCalledTimes(1);
	expect(jest.getTimerCount()).toBe(1);
	await jest.advanceTimersByTimeAsync(5000);
	expect(await pending).toEqual({ status: 'error', reason: 'timeout' });
	expect(fetchSpy.mock.calls[0][1].signal.aborted).toBe(true);
	expect(jest.getTimerCount()).toBe(0);
	resolve([]);
	await Promise.resolve();
	expect(fetchSpy).toHaveBeenCalledTimes(1);
});
it.each([201, 204, 409, 429, 502, 503])(
	'preserves backend classification for HTTP %i without parsing its body',
	async (status) => {
		const response = new Response(null, { status });
		const json = jest.spyOn(response, 'json');
		fetchSpy.mockResolvedValue(response);
		expect(await readSettingsCatalog(gate, config)).toEqual({ status: 'error', reason: 'backend' });
		expect(json).not.toHaveBeenCalled();
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	},
);
it('ignores inactive and unknown codes without validating their display-only fields', async () => {
	reply([
		{ ...tariff(), isActive: false, finalPrice: null },
		{ ...tariff(2, 'trial'), monthPeriod: null },
	]);
	expect(await readSettingsCatalog(gate, config)).toEqual({ status: 'success', gate, tariffs: [] });
	expect(fetchSpy).toHaveBeenCalledTimes(1);
});
