'use client';

import { useSyncExternalStore } from 'react';

import { endSession, restoreSession } from './client';
import type { WebSession } from './session';

type Snapshot = { session: WebSession | null; loading: boolean; unavailable: boolean };
const initial: Snapshot = { session: null, loading: true, unavailable: false };
let snapshot = initial;
let generation = 0;
let mutation = false;
let reading: Promise<void> | undefined;
const listeners = new Set<() => void>();
const signalKey = 'yh-session-changed';
const publish = (value: Snapshot) => {
	snapshot = value;
	listeners.forEach((listener) => listener());
};
const signal = () => {
	// Only an invalidation marker; no session data or credentials in browser storage.
	try {
		localStorage.setItem(signalKey, `${Date.now()}:${Math.random()}`);
	} catch {
		// Focus/visibility revalidation also works when storage is unavailable.
	}
};

export const refreshCurrentSession = async (): Promise<void> => {
	if (mutation) return;
	if (reading) return reading;
	const version = generation;
	reading = restoreSession()
		.then((session) => {
			if (version === generation) publish({ session, loading: false, unavailable: false });
		})
		.catch(() => {
			if (version === generation) publish({ session: null, loading: false, unavailable: true });
		})
		.finally(() => {
			reading = undefined;
		});
	return reading;
};

export const beginSessionChange = () => {
	generation += 1;
	mutation = true;
	publish({ session: null, loading: false, unavailable: false }); // Never retain the previous account while credentials are changing.
};

export const acceptSession = (session: WebSession | null) => {
	generation += 1;
	mutation = false;
	publish({ session, loading: false, unavailable: false });
	signal();
};

const invalidate = async () => {
	if (mutation) return;
	generation += 1;
	publish(initial);
	// Discard an in-flight read of the previous cookies before reading the new session.
	await reading;
	await refreshCurrentSession();
};

export const notifySessionChanged = () => {
	mutation = false;
	signal();
	if (listeners.size) void invalidate();
	else {
		generation += 1;
		snapshot = initial;
	}
};

export const logoutSession = async () => {
	beginSessionChange();
	publish({ session: null, loading: false, unavailable: false });
	try {
		const revoked = await endSession();
		acceptSession(null);
		return revoked;
	} catch (error) {
		mutation = false;
		signal();
		await invalidate();
		throw error;
	}
};

let stop: (() => void) | undefined;
const subscribe = (listener: () => void) => {
	listeners.add(listener);
	if (listeners.size === 1) void invalidate();
	const onFocus = () => {
		void invalidate();
	};
	const onVisibility = () => {
		if (document.visibilityState === 'visible') void invalidate();
	};
	const onStorage = (event: StorageEvent) => {
		if (event.key === signalKey) void invalidate();
	};
	// One set of browser listeners regardless of the number of consumers.
	const unsubscribe = () => {
		listeners.delete(listener);
		if (!listeners.size) {
			stop?.();
			stop = undefined;
		}
	};
	if (listeners.size !== 1) return unsubscribe;
	const timer = window.setInterval(() => {
		void refreshCurrentSession();
	}, 60000);
	window.addEventListener('focus', onFocus);
	window.addEventListener('storage', onStorage);
	document.addEventListener('visibilitychange', onVisibility);
	stop = () => {
		clearInterval(timer);
		window.removeEventListener('focus', onFocus);
		window.removeEventListener('storage', onStorage);
		document.removeEventListener('visibilitychange', onVisibility);
	};
	return unsubscribe;
};

export const useSession = () =>
	useSyncExternalStore(
		subscribe,
		() => (listeners.size ? snapshot : initial),
		() => initial,
	);
