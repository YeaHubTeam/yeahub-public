/** @jest-environment node */
import { evaluateTariffGate, readTariffFlag } from './featureFlags.server';

jest.mock('server-only', () => ({}), { virtual: true });
const config = {
	apiOrigin: 'https://backend.example',
	allowedOrigins: ['https://backend.example'],
};
const key = 'dashboard.subscription.show-tariffs';
const flag = {
	flag: key,
	clientType: 'WEB',
	enabled: true,
	roles: [] as string[],
	private: 'hidden',
};
const list = (items: unknown[] = [flag]) => ({
	data: items,
	page: 1,
	limit: 10,
	total: items.length,
});
let fetchSpy: jest.SpyInstance;
beforeEach(() => {
	fetchSpy = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Private failure'));
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
});
const reply = (body: unknown, status = 200) =>
	fetchSpy.mockResolvedValue(new Response(JSON.stringify(body), { status }));
it('loads the public exact WEB flag once without credentials or extra fields', async () => {
	reply(list());
	expect(await readTariffFlag(config)).toEqual({ status: 'success', enabled: true, roles: [] });
	expect(fetchSpy).toHaveBeenCalledTimes(1);
	const [url, options] = fetchSpy.mock.calls[0];
	expect(url.pathname).toBe('/feature-flags');
	expect(Object.fromEntries(url.searchParams)).toEqual({
		clientType: 'WEB',
		search: key,
		page: '1',
		limit: '10',
	});
	expect(options).toMatchObject({ cache: 'no-store', redirect: 'manual', credentials: 'omit' });
	expect(options.headers).toBeUndefined();
});
it.each(
	[[], [{ ...flag, flag: `${key}.other` }], [{ ...flag, clientType: 'IOS' }]].map((items) => ({
		items,
	})),
)('does not confuse partial keys or other clients with the flag %#', async ({ items }) => {
	reply(list(items));
	expect(await readTariffFlag(config)).toEqual({ status: 'missing' });
});
it.each([
	null,
	[],
	{},
	{ ...list(), total: 11 },
	{ ...list(), total: 0 },
	{ ...list(), page: 2 },
	{ ...list(), limit: 20 },
	list([flag, flag]),
	list([{ ...flag, enabled: 'true' }]),
	list([{ ...flag, roles: undefined }]),
	list([{ ...flag, roles: [{}] }]),
	list([{ ...flag, roles: [''] }]),
])('fails closed for malformed, duplicate or incomplete flag lists %#', async (value) => {
	reply(value);
	expect(await readTariffFlag(config)).toEqual({ status: 'unavailable' });
	expect(fetchSpy).toHaveBeenCalledTimes(1);
});
it.each([401, 403, 404, 500, 302])('fails closed on HTTP %s without retries', async (status) => {
	reply({}, status);
	expect(await readTariffFlag(config)).toEqual({ status: 'unavailable' });
	expect(fetchSpy).toHaveBeenCalledTimes(1);
});
it('handles network and invalid JSON without exposing errors', async () => {
	expect(await readTariffFlag(config)).toEqual({ status: 'unavailable' });
	fetchSpy.mockResolvedValue(new Response('invalid'));
	expect(await readTariffFlag(config)).toEqual({ status: 'unavailable' });
});
it('bounds a hanging request and aborts without retries', async () => {
	jest.useFakeTimers();
	fetchSpy.mockImplementation(() => new Promise(() => {}));
	const result = readTariffFlag(config);
	const signal = fetchSpy.mock.calls[0][1].signal;
	await jest.advanceTimersByTimeAsync(5000);
	expect(await result).toEqual({ status: 'unavailable' });
	expect(signal.aborted).toBe(true);
	expect(fetchSpy).toHaveBeenCalledTimes(1);
});
it('rejects an untrusted origin without requests', async () => {
	expect(await readTariffFlag({ ...config, allowedOrigins: [] })).toEqual({
		status: 'unavailable',
	});
	expect(fetchSpy).not.toHaveBeenCalled();
});
it.each([
	{ roles: [], user: null, expected: 'allowed' },
	{ roles: ['candidate'], user: ['candidate'], expected: 'allowed' },
	{ roles: ['candidate'], user: ['Candidate'], expected: 'role-denied' },
	{ roles: ['admin'], user: ['candidate-premium'], expected: 'role-denied' },
	{ roles: ['candidate'], user: null, expected: 'unavailable' },
])('matches validated role names exactly %#', ({ roles, user, expected }) => {
	expect(evaluateTariffGate({ status: 'success', enabled: true, roles }, user)).toEqual({
		status: expected,
		showTariffs: expected === 'allowed',
	});
});
it('preserves disabled, missing and unavailable decisions', () => {
	expect(evaluateTariffGate({ status: 'success', enabled: false, roles: [] }, [])).toEqual({
		status: 'disabled',
		showTariffs: false,
	});
	for (const status of ['missing', 'unavailable'] as const)
		expect(evaluateTariffGate({ status }, [])).toEqual({ status, showTariffs: false });
});
it('does not fetch on import', () => {
	expect(fetchSpy).not.toHaveBeenCalled();
});
