import { endSession, restoreSession } from './client';

const current = { user: { id: 'local-a' }, activeProfile: null };
let fetchMock: jest.Mock;
let valid: boolean;
let refreshes: number;
let queue: Promise<unknown>;
const locks = {
	request: (_name: string, callback: () => Promise<unknown>) => {
		const result = queue.then(callback);
		queue = result.catch(() => undefined);
		return result;
	},
};
beforeEach(() => {
	valid = false;
	refreshes = 0;
	queue = Promise.resolve();
	Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { locks } });
	fetchMock = jest.fn((url: string) => {
		if (url.endsWith('/refresh')) {
			refreshes++;
			valid = true;
			return Promise.resolve(Response.json({ session: current }));
		}
		return Promise.resolve(
			Response.json({ session: valid ? current : null }, { status: valid ? 200 : 401 }),
		);
	});
	global.fetch = fetchMock;
});
it('одновременные reads одного client module используют один refresh', async () => {
	const results = await Promise.all([restoreSession(), restoreSession(), restoreSession()]);
	expect(refreshes).toBe(1);
	expect(results).toEqual([current, current, current]);
});
it('две вкладки: отдельные module states, общий Web Lock и cookies', async () => {
	let otherTab: typeof import('./client');
	jest.isolateModules(() => {
		otherTab = jest.requireActual('./client');
	});
	const results = await Promise.all([restoreSession(), otherTab!.restoreSession()]);
	expect(refreshes).toBe(1);
	expect(results).toEqual([current, current]);
});
it('refresh отказ: guest без повторного refresh', async () => {
	fetchMock.mockImplementation(() => Promise.resolve(new Response(null, { status: 401 })));
	expect(await restoreSession()).toBeNull();
	expect(fetchMock.mock.calls.filter(([url]: [string]) => url.endsWith('/refresh'))).toHaveLength(
		1,
	);
	expect(fetchMock).toHaveBeenCalledTimes(3);
});
it('401 после успешного refresh не запускает loop', async () => {
	fetchMock.mockImplementation((url: string) =>
		Promise.resolve(new Response(null, { status: url.endsWith('/refresh') ? 200 : 401 })),
	);
	expect(await restoreSession()).toBeNull();
	expect(fetchMock).toHaveBeenCalledTimes(4);
});
it('ошибка upstream 503 не вызывает refresh и не маскируется под guest', async () => {
	fetchMock.mockResolvedValue(new Response(null, { status: 503 }));
	await expect(restoreSession()).rejects.toThrow('AUTH_UNAVAILABLE');
	expect(fetchMock).toHaveBeenCalledTimes(1);
});
it('без Web Locks остаётся локальный single-flight', async () => {
	Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} });
	await Promise.all([restoreSession(), restoreSession()]);
	expect(refreshes).toBe(1);
});
it('logout различает local cleanup и подтверждённый revoke', async () => {
	fetchMock.mockResolvedValue(new Response(null, { status: 502 }));
	expect(await endSession()).toBe(false);
});
