import '@testing-library/jest-dom';
import * as nextRouterMock from 'next-router-mock';

/**
 * Мокаем App Router API (useRouter/usePathname/useSearchParams).
 * Если ESLint ругнётся на "unsafe return", оставь директиву ниже.
 */
jest.mock('next/navigation', () => nextRouterMock);

/**
 * JSDOM не имеет matchMedia — добавляем мок.
 */
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // deprecated
		removeListener: jest.fn(), // deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});

/**
 * Простой мок BroadcastChannel (можно удалить, если не нужен).
 */
class BroadcastChannelMock {
	name: string;
	onmessage: ((event: { data: unknown }) => void) | null = null;

	constructor(name: string) {
		this.name = name;
	}

	postMessage(data: unknown) {
		this.onmessage?.({ data });
	}

	close() {
		/* noop */
	}
	addEventListener = jest.fn();
	removeEventListener = jest.fn();
	dispatchEvent = jest.fn();
}
// @ts-expect-error: добавляем в глобал для тестов
global.BroadcastChannel = BroadcastChannelMock;

// Если хочешь — раскомментируй
// afterEach(() => { jest.clearAllMocks(); });
