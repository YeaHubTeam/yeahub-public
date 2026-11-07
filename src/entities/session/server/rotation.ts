import { createHash } from 'node:crypto';
import 'server-only';

import { Credentials, credentialsFromResponse, upstream } from './transport';

// Ограниченная координация одного Node process, НЕ distributed guarantee.
// Короткий grace cache позволяет параллельным запросам со старой cookie получить одну пару.
const rotations = new Map<string, { expires: number; result: Promise<Credentials> }>();
const remember = (key: string, result: Promise<Credentials>) => {
	const entry = { expires: Date.now() + 15000, result };
	rotations.set(key, entry);
	setTimeout(() => {
		if (rotations.get(key) === entry) rotations.delete(key);
	}, 15000).unref();
};
const keyOf = (token: string) => createHash('sha256').update(token).digest('hex');

export const rotate = (refresh: string): Promise<Credentials> => {
	const now = Date.now();
	for (const [key, entry] of rotations) if (entry.expires <= now) rotations.delete(key);
	const key = keyOf(refresh);
	const existing = rotations.get(key);
	if (existing) return existing.result;
	// Не вытесняем выполняющуюся ротацию: при перегрузке fail closed вместо второго refresh.
	if (rotations.size >= 256) return Promise.reject(new Error('AUTH_BUSY'));
	const result = (async () => {
		const response = await upstream('refresh', undefined, undefined, refresh);
		if (!response.ok) throw new Error('AUTH_EXPIRED');
		return credentialsFromResponse(response);
	})();
	remember(key, result);
	return result;
};

export const forgetRotation = (refresh: string) => {
	// Новые локальные запросы со старой cookie после logout завершаются отказом.
	const result = Promise.reject<Credentials>(new Error('AUTH_EXPIRED'));
	void result.catch(() => undefined);
	remember(keyOf(refresh), result);
};
