/** @jest-environment node */
import { getTelegramWidgetConfig } from './telegram.server';

jest.mock('server-only', () => ({}), { virtual: true });

// Replace the environment with synthetic data; never inspect actual deployment values.
beforeEach(() => {
	jest.replaceProperty(process, 'env', {});
});
afterEach(() => {
	jest.restoreAllMocks();
});

it('reports missing configuration', () => {
	expect(getTelegramWidgetConfig()).toEqual({ status: 'missing' });
});
it('reports an empty value as missing', () => {
	process.env.TELEGRAM_BOT_NAME = '';
	expect(getTelegramWidgetConfig()).toEqual({ status: 'missing' });
});
it.each(['TestBot', 'test_bot', '12bot', '__BOT', 'a'.repeat(29) + 'bOt'])(
	'accepts the documented format %# without changing case',
	(value) => {
		process.env.TELEGRAM_BOT_NAME = value;
		expect(getTelegramWidgetConfig()).toEqual({ status: 'success', botUsername: value });
	},
);
it.each([
	'bot',
	'abot',
	'a'.repeat(30) + 'bot',
	'TestName',
	'test-bot',
	'test.bot',
	'тестbot',
	'@TestBot',
	' TestBot',
	'TestBot ',
	'TestBot\n',
	'TestBot\r',
	'Test Bot',
	'TestBot/',
	'   ',
])('rejects invalid configuration %# without returning the value', (value) => {
	process.env.TELEGRAM_BOT_NAME = value;
	expect(getTelegramWidgetConfig()).toEqual({ status: 'invalid' });
});
it('reads configuration lazily on each call without caching', () => {
	const read = jest.fn(() => 'SyntheticBot');
	Object.defineProperty(process.env, 'TELEGRAM_BOT_NAME', { get: read, configurable: true });
	jest.isolateModules(() => {
		const configModule: typeof import('./telegram.server') =
			jest.requireActual('./telegram.server');
		expect(read).not.toHaveBeenCalled();
		expect(configModule.getTelegramWidgetConfig()).toEqual({
			status: 'success',
			botUsername: 'SyntheticBot',
		});
		expect(read).toHaveBeenCalledTimes(1);
		read.mockReturnValue('AnotherBot');
		expect(configModule.getTelegramWidgetConfig()).toEqual({
			status: 'success',
			botUsername: 'AnotherBot',
		});
		expect(read).toHaveBeenCalledTimes(2);
	});
});
it('does not read bot token or any unrelated environment key', () => {
	const reads: string[] = [];
	jest.replaceProperty(
		process,
		'env',
		new Proxy(
			{ TELEGRAM_BOT_NAME: 'SyntheticBot' },
			{
				get(target, key, receiver) {
					reads.push(String(key));
					return Reflect.get(target, key, receiver);
				},
			},
		),
	);
	const result = getTelegramWidgetConfig();
	expect(reads).toEqual(['TELEGRAM_BOT_NAME']);
	expect(result).toEqual({ status: 'success', botUsername: 'SyntheticBot' });
});
it('does not perform network requests or log configuration', () => {
	const fetchSpy = jest
		.spyOn(globalThis, 'fetch')
		.mockRejectedValue(new Error('Unexpected network access'));
	const log = jest.spyOn(console, 'log').mockImplementation(() => {});
	const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
	const error = jest.spyOn(console, 'error').mockImplementation(() => {});
	process.env.TELEGRAM_BOT_NAME = 'SyntheticBot';
	getTelegramWidgetConfig();
	expect(fetchSpy).not.toHaveBeenCalled();
	expect(log).not.toHaveBeenCalled();
	expect(warn).not.toHaveBeenCalled();
	expect(error).not.toHaveBeenCalled();
});
