/** @jest-environment jsdom */
import { StrictMode } from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';

import { AuthRefreshProvider } from './AuthRefreshProvider';

const validSession = (requiresRefresh: boolean) => ({
	user: { id: 'synthetic-user', username: 'sample' },
	expires: '2099-01-01T00:00:00.000Z',
	requiresRefresh,
});
type PublicSession = ReturnType<typeof validSession> | null;
let current: PublicSession;
let next: PublicSession;
let calls: jest.Mock;
const posts = () => calls.mock.calls.filter(([, init]) => init?.method === 'POST');
const Probe = () => {
	const { data, status } = useSession();
	return (
		<span data-testid="session">
			{status}:{data && 'requiresRefresh' in data ? String(data.requiresRefresh) : 'none'}
		</span>
	);
};
const mount = async (strict = false) => {
	await act(async () => {
		await Promise.resolve();
		render(
			strict ? (
				<StrictMode>
					<AuthRefreshProvider>
						<Probe />
					</AuthRefreshProvider>
				</StrictMode>
			) : (
				<AuthRefreshProvider>
					<Probe />
				</AuthRefreshProvider>
			),
		);
	});
};

// Exercise Auth.js's public getSession broadcast synchronization without real browser IO.
const channels = new Set<TestBroadcastChannel>();
class TestBroadcastChannel {
	private listeners = new Set<() => void>();
	constructor(public name: string) {
		channels.add(this);
	}
	addEventListener(_type: string, listener: () => void) {
		this.listeners.add(listener);
	}
	removeEventListener(_type: string, listener: () => void) {
		this.listeners.delete(listener);
	}
	postMessage() {
		for (const channel of channels) {
			if (channel !== this && channel.name === this.name) {
				void Promise.resolve().then(() => {
					for (const listener of channel.listeners) listener();
				});
			}
		}
	}
	close() {
		channels.delete(this);
	}
}
Object.defineProperty(globalThis, 'BroadcastChannel', {
	configurable: true,
	value: TestBroadcastChannel,
});
beforeEach(() => {
	jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] });
	current = validSession(true);
	next = validSession(false);
	calls = jest.fn((url: string, init?: RequestInit) => {
		if (url.endsWith('/csrf'))
			return Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ csrfToken: 'synthetic-csrf' }),
			});
		if (init?.method === 'POST') current = next;
		return Promise.resolve({ ok: true, json: () => Promise.resolve(current) });
	});
	Object.defineProperty(globalThis, 'fetch', { configurable: true, writable: true, value: calls });
});
afterEach(() => {
	cleanup();
	jest.clearAllTimers();
	jest.useRealTimers();
	jest.restoreAllMocks();
});

describe('browser Auth.js refresh with the real SessionProvider', () => {
	it('updates once with an empty payload and synchronizes session after success', async () => {
		await mount();
		expect(posts()).toHaveLength(1);
		expect(JSON.parse(posts()[0][1].body)).toEqual({ csrfToken: 'synthetic-csrf', data: {} });
		expect(screen.getByTestId('session').textContent).toBe('authenticated:false');
		expect(calls.mock.calls.every(([url]) => !url.includes('backend'))).toBe(true);
	});
	it.each([false, null])('does not update without a stale session: %s', async (flag) => {
		current = flag === null ? null : validSession(flag);
		await mount();
		expect(posts()).toHaveLength(0);
	});
	it('does not repeat after rerenders or focus following success', async () => {
		await mount();
		await act(async () => {
			await Promise.resolve();
			fireEvent.focus(window);
		});
		expect(posts()).toHaveLength(1);
	});
	it('avoids retry loops and allows a user-triggered retry only after cooldown', async () => {
		next = validSession(true);
		await mount();
		expect(posts()).toHaveLength(1);
		await act(async () => {
			await Promise.resolve();
			jest.advanceTimersByTime(29_000);
			fireEvent.focus(window);
		});
		expect(posts()).toHaveLength(1);
		next = validSession(false);
		await act(async () => {
			await Promise.resolve();
			jest.advanceTimersByTime(1_000);
			fireEvent(window, new Event('online'));
		});
		expect(posts()).toHaveLength(2);
		expect(screen.getByTestId('session').textContent).toBe('authenticated:false');
	});
	it('does not retry indefinitely on unchanged temporary-failure session reads', async () => {
		next = validSession(true);
		await mount();
		await act(async () => {
			await Promise.resolve();
			jest.advanceTimersByTime(180_000);
		});
		expect(posts()).toHaveLength(1);
	});
	it('clears stale client identity after a null update result', async () => {
		next = null;
		await mount();
		expect(posts()).toHaveLength(1);
		expect(screen.getByTestId('session').textContent).toBe('unauthenticated:none');
	});
	it('keeps one in-flight update across focus events', async () => {
		let finish: (response: object) => void;
		calls.mockImplementation((url: string, init?: RequestInit) => {
			if (url.endsWith('/csrf'))
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ csrfToken: 'synthetic-csrf' }),
				});
			if (init?.method === 'POST')
				return new Promise((resolve) => {
					finish = resolve;
				});
			return Promise.resolve({ ok: true, json: () => Promise.resolve(current) });
		});
		await mount();
		await act(async () => {
			await Promise.resolve();
			fireEvent.focus(window);
			fireEvent(window, new Event('online'));
		});
		expect(posts()).toHaveLength(1);
		await act(async () => {
			await Promise.resolve();
			finish!({ ok: true, json: () => Promise.resolve(validSession(false)) });
		});
		expect(screen.getByTestId('session').textContent).toBe('authenticated:false');
	});
	it('avoids a null-result network loop when the subsequent read still returns the old session', async () => {
		calls.mockImplementation((url: string, init?: RequestInit) => {
			if (url.endsWith('/csrf'))
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ csrfToken: 'synthetic-csrf' }),
				});
			return Promise.resolve({
				ok: true,
				json: () => Promise.resolve(init?.method === 'POST' ? null : current),
			});
		});
		await mount();
		await act(async () => {
			await Promise.resolve();
			jest.advanceTimersByTime(180_000);
		});
		expect(posts()).toHaveLength(1);
	});
	it('does not duplicate updates under React StrictMode', async () => {
		await mount(true);
		expect(posts()).toHaveLength(1);
	});
});
