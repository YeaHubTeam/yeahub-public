import { act, render } from '@testing-library/react';

import { TelegramWidget } from './TelegramWidget';

const callbackName = (script: Element) => script.getAttribute('data-onauth')!.split('(')[0];
const callback = (name: string) =>
	(window as unknown as Record<string, (payload: unknown) => void>)[name];
it('loads the exact React widget settings and forwards signed data unchanged', () => {
	const onAuth = jest.fn();
	const onError = jest.fn();
	const view = render(
		<TelegramWidget botUsername="SyntheticBot" onAuth={onAuth} onError={onError} />,
	);
	const script = view.container.querySelector('script')!;
	expect(script.src).toBe('https://telegram.org/js/telegram-widget.js?9');
	for (const [key, value] of Object.entries({
		'data-telegram-login': 'SyntheticBot',
		'data-size': 'large',
		'data-radius': '15',
		'data-request-access': 'write',
		'data-userpic': 'true',
		'data-lang': 'en',
	}))
		expect(script).toHaveAttribute(key, value);
	const payload = { id: 123, first_name: ' Имя ', hash: 'synthetic', auth_date: 123 };
	callback(callbackName(script))(payload);
	expect(onAuth).toHaveBeenCalledWith(payload);
	expect(onAuth.mock.calls[0][0]).toBe(payload);
});
it('cleans script, callback and iframe, and ignores stale callbacks', () => {
	const onAuth = jest.fn();
	const onError = jest.fn();
	const view = render(
		<TelegramWidget botUsername="SyntheticBot" onAuth={onAuth} onError={onError} />,
	);
	const script = view.container.querySelector('script')!;
	const name = callbackName(script);
	const old = callback(name);
	const frame = document.createElement('iframe');
	script.parentElement!.appendChild(frame);
	view.unmount();
	expect(script.isConnected).toBe(false);
	expect(frame.isConnected).toBe(false);
	expect(callback(name)).toBeUndefined();
	old({ id: 1 });
	expect(onAuth).not.toHaveBeenCalled();
});
it('uses unique callback names and does not disturb a second widget', () => {
	const one = render(
		<TelegramWidget botUsername="SyntheticBot" onAuth={jest.fn()} onError={jest.fn()} />,
	);
	const two = render(
		<TelegramWidget botUsername="AnotherBot" onAuth={jest.fn()} onError={jest.fn()} />,
	);
	const name1 = callbackName(one.container.querySelector('script')!);
	const name2 = callbackName(two.container.querySelector('script')!);
	expect(name1).not.toBe(name2);
	one.unmount();
	expect(callback(name2)).toEqual(expect.any(Function));
	two.unmount();
	expect(callback(name2)).toBeUndefined();
});
it.each([null, '', 'invalid', '@SyntheticBot', 'SyntheticBot\n'])(
	'does not load script for invalid config %#',
	(botUsername) => {
		const view = render(
			<TelegramWidget botUsername={botUsername} onAuth={jest.fn()} onError={jest.fn()} />,
		);
		expect(view.container.querySelector('script')).toBeNull();
	},
);
it('updates callbacks without reloading script and cleans up on bot change', () => {
	const onAuth = jest.fn();
	const next = jest.fn();
	const onError = jest.fn();
	const view = render(
		<TelegramWidget botUsername="SyntheticBot" onAuth={onAuth} onError={onError} />,
	);
	const script = view.container.querySelector('script')!;
	const name = callbackName(script);
	view.rerender(<TelegramWidget botUsername="SyntheticBot" onAuth={next} onError={onError} />);
	expect(view.container.querySelector('script')).toBe(script);
	callback(name)({});
	expect(next).toHaveBeenCalledTimes(1);
	expect(onAuth).not.toHaveBeenCalled();
	act(() => {
		script.dispatchEvent(new Event('error'));
	});
	expect(onError).toHaveBeenCalledTimes(1);
	view.rerender(<TelegramWidget botUsername="AnotherBot" onAuth={next} onError={onError} />);
	expect(callback(name)).toBeUndefined();
	expect(script.isConnected).toBe(false);
});
