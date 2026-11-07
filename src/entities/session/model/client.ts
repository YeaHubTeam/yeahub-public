'use client';

import type { WebSession } from './session';

let restoring: Promise<WebSession | null> | undefined;

const read = () => fetch('/api/auth/session', { cache: 'no-store', credentials: 'same-origin' });
const extract = async (response: Response): Promise<WebSession | null> => {
	if (response.status === 401) return null;
	if (!response.ok) throw new Error('AUTH_UNAVAILABLE');
	return ((await response.json()) as { session: WebSession }).session;
};

// Повторяем read ровно один раз. Нет recursive retries или refresh на 403/5xx.
export const restoreSession = (): Promise<WebSession | null> => {
	if (restoring) return restoring;
	const operation = async () => {
		const first = await read();
		if (first.status !== 401) return extract(first);
		const refreshOnce = async () => {
			// Другая вкладка могла уже обновить общие cookies, пока мы ждали lock.
			const latest = await read();
			if (latest.status !== 401) return extract(latest);
			const refreshed = await fetch('/api/auth/refresh', {
				method: 'POST',
				cache: 'no-store',
				credentials: 'same-origin',
			});
			if (refreshed.status === 401) return null;
			if (!refreshed.ok) throw new Error('AUTH_UNAVAILABLE');
			return extract(await read());
		};
		return navigator.locks ? navigator.locks.request('yh-web-session', refreshOnce) : refreshOnce();
	};
	restoring = operation().finally(() => {
		restoring = undefined;
	});
	return restoring;
};

export const endSession = async (): Promise<boolean> => {
	const operation = async () => {
		const response = await fetch('/api/auth/logout', {
			method: 'POST',
			cache: 'no-store',
			credentials: 'same-origin',
		});
		if (response.status === 502) return false; // Cookie очищена, upstream revoke не подтверждён.
		if (!response.ok) throw new Error('AUTH_UNAVAILABLE');
		return true;
	};
	if (restoring) await restoring.catch(() => null);
	return navigator.locks ? navigator.locks.request('yh-web-session', operation) : operation();
};
