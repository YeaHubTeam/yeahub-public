/** @jest-environment node */
import { readQuestionPersonalState } from './personalState.server';

jest.mock('server-only', () => ({}), { virtual: true });
const config = {
	apiOrigin: 'https://backend.example',
	allowedOrigins: ['https://backend.example'],
};
const credentials = {
	profileId: '11111111-1111-4111-8111-111111111111',
	accessToken: 'synthetic-access',
};
const dto = {
	id: 7,
	checksCount: 2,
	isLearned: true,
	isFavorite: false,
	accessToken: 'must-not-leak',
	longAnswer: 'private content',
};
let request: jest.SpyInstance;
beforeEach(() => {
	request = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network forbidden'));
});
afterEach(() => {
	jest.restoreAllMocks();
	jest.useRealTimers();
});
it('reads exactly one authenticated question and returns only personal fields', async () => {
	request.mockResolvedValue(new Response(JSON.stringify(dto)));
	expect(await readQuestionPersonalState(7, credentials, config)).toEqual({
		status: 'success',
		state: { questionId: 7, checksCount: 2, isLearned: true, isFavorite: false },
	});
	expect(request).toHaveBeenCalledTimes(1);
	const [url, options] = request.mock.calls[0];
	expect(String(url)).toBe(
		`https://backend.example/questions/7?profileId=${credentials.profileId}`,
	);
	expect(options).toMatchObject({
		method: 'GET',
		cache: 'no-store',
		redirect: 'manual',
		credentials: 'omit',
	});
	expect([...new Headers(options.headers)]).toEqual([['authorization', 'Bearer synthetic-access']]);
});
it.each([
	[401, 'unauthenticated'],
	[403, 'forbidden'],
	[404, 'not-found'],
	[500, 'error'],
	[201, 'error'],
	[302, 'error'],
])('maps HTTP %s without retry', async (status, expected) => {
	request.mockResolvedValue(new Response('{}', { status }));
	expect(await readQuestionPersonalState(7, credentials, config)).toEqual({ status: expected });
	expect(request).toHaveBeenCalledTimes(1);
});
it.each([
	{ ...dto, id: 8 },
	{ ...dto, checksCount: -1 },
	{ ...dto, checksCount: 0.5 },
	{ ...dto, isFavorite: 'true' },
	{ ...dto, isLearned: undefined },
])('rejects invalid DTO %j', async (value) => {
	request.mockResolvedValue(new Response(JSON.stringify(value)));
	expect(await readQuestionPersonalState(7, credentials, config)).toEqual({ status: 'error' });
});
it('rejects invalid identifiers before HTTP', async () => {
	expect(await readQuestionPersonalState(-1, credentials, config)).toEqual({ status: 'error' });
	expect(
		await readQuestionPersonalState(7, { ...credentials, profileId: '../other' }, config),
	).toEqual({ status: 'error' });
	expect(request).not.toHaveBeenCalled();
});
it('maps network and malformed JSON to error', async () => {
	expect(await readQuestionPersonalState(7, credentials, config)).toEqual({ status: 'error' });
	request.mockResolvedValue(new Response('{'));
	expect(await readQuestionPersonalState(7, credentials, config)).toEqual({ status: 'error' });
});
it.each(['headers', 'body'])('bounds a hanging %s read', async (phase) => {
	jest.useFakeTimers();
	request.mockImplementation(() =>
		phase === 'headers'
			? new Promise(() => {})
			: Promise.resolve({ status: 200, json: () => new Promise(() => {}) }),
	);
	const result = readQuestionPersonalState(7, credentials, config);
	await jest.advanceTimersByTimeAsync(5001);
	expect(await result).toEqual({ status: 'error' });
	expect(request).toHaveBeenCalledTimes(1);
	expect(jest.getTimerCount()).toBe(0);
});
