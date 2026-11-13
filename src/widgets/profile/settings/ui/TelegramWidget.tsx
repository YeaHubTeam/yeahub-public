'use client';

import { useEffect, useRef } from 'react';

let sequence = 0;
export const TelegramWidget = ({
	botUsername,
	onAuth,
	onError,
}: {
	botUsername: string | null;
	onAuth: (payload: unknown) => void;
	onError: () => void;
}) => {
	const container = useRef<HTMLDivElement>(null);
	const callbacks = useRef({ onAuth, onError });
	useEffect(() => {
		callbacks.current = { onAuth, onError };
	}, [onAuth, onError]);
	useEffect(() => {
		if (
			!botUsername ||
			botUsername.length < 5 ||
			botUsername.length > 32 ||
			/[^a-z0-9_]/i.test(botUsername) ||
			botUsername.slice(-3).toLowerCase() !== 'bot' ||
			!container.current
		)
			return;
		const globals = window as unknown as Record<string, unknown>;
		let name: string;
		do {
			name = `__yeahubTelegramAuth_${++sequence}`;
		} while (name in globals);
		let active = true;
		const callback = (payload: unknown) => {
			if (active) callbacks.current.onAuth(payload);
		};
		globals[name] = callback;
		// Own every node created by Telegram, including its iframe, inside a disposable host.
		const host = document.createElement('div');
		const script = document.createElement('script');
		script.src = 'https://telegram.org/js/telegram-widget.js?9';
		script.async = true;
		const attributes = {
			'data-telegram-login': botUsername,
			'data-size': 'large',
			'data-radius': '15',
			'data-request-access': 'write',
			'data-userpic': 'true',
			'data-lang': 'en',
			'data-onauth': `${name}(user)`,
		};
		Object.entries(attributes).forEach(([key, value]) => script.setAttribute(key, value));
		script.onerror = () => {
			if (active) callbacks.current.onError();
		};
		host.appendChild(script);
		container.current.appendChild(host);
		return () => {
			active = false;
			script.onerror = null;
			if (globals[name] === callback) delete globals[name];
			host.replaceChildren();
			host.remove();
		};
	}, [botUsername]);
	return <div ref={container} />;
};
