import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from 'public/locales/ru/questions.json';

import {
	QuestionFavoriteActions,
	QuestionPersonalStateProvider,
	QuestionProgress,
} from './QuestionPersonalState';

let mockSession: { user: { id: string } } | null = { user: { id: 'user-a' } };
let mockAuthStatus = 'authenticated';
let mockMobile = false;
jest.mock('react-responsive', () => ({
	useMediaQuery: ({ query }: { query: string }) => mockMobile && query === '(max-width: 767px)',
}));
jest.mock('next-auth/react', () => ({
	useSession: () => ({ data: mockSession, status: mockAuthStatus }),
}));
jest.mock('@/shared/config', () => ({ i18Namespace: { questions: 'questions' } }));
jest.mock('@/shared/ui/Card', () => ({
	Card: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
	CardSkeleton: ({ children }: { children: React.ReactNode }) => (
		<section data-testid="progress-skeleton">{children}</section>
	),
}));
jest.mock('@/shared/ui/Text', () => ({
	Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
	TextSkeleton: () => <span data-testid="text-skeleton" />,
}));
const originalFetch = globalThis.fetch;
const request = jest.fn();
const result = (userId = 'user-a', profileId = 'profile-a', checksCount = 2) => ({
	status: 'success',
	userId,
	profileId,
	state: { questionId: 7, checksCount, isLearned: true, isFavorite: true },
});
const response = (value: unknown) => ({ json: () => Promise.resolve(value) });
const view = (id = 7) => (
	<NextIntlClientProvider locale="ru" messages={{ questions: messages }}>
		<QuestionPersonalStateProvider questionId={id}>
			<QuestionProgress />
		</QuestionPersonalStateProvider>
	</NextIntlClientProvider>
);
beforeEach(() => {
	mockSession = { user: { id: 'user-a' } };
	mockAuthStatus = 'authenticated';
	mockMobile = false;
	request.mockReset().mockResolvedValue(response(result()));
	globalThis.fetch = request;
});
afterEach(() => {
	globalThis.fetch = originalFetch;
});
it('guest and mockSession loading do not fetch or render personal content', () => {
	mockSession = null;
	mockAuthStatus = 'unauthenticated';
	const { rerender, container } = render(view());
	expect(request).not.toHaveBeenCalled();
	expect(container.textContent).toBe('');
	mockAuthStatus = 'loading';
	rerender(view());
	expect(request).not.toHaveBeenCalled();
});
it('shows loading then actual Russian personal state through the real provider', async () => {
	render(view());
	expect(screen.getByTestId('progress-skeleton')).toBeInTheDocument();
	await screen.findByText('Вопрос изучен 2 из 3');
	expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
	expect(screen.queryByText('В избранном')).not.toBeInTheDocument();
	expect(request).toHaveBeenCalledWith(
		'/api/questions/7/personal-state',
		expect.objectContaining({ cache: 'no-store', credentials: 'same-origin', redirect: 'error' }),
	);
	expect(request.mock.calls[0][1]).not.toHaveProperty('headers');
});
it.each([
	['no-active-profile', 'Нет активного профиля'],
	['error', 'Не удалось загрузить прогресс'],
	['forbidden', 'Не удалось загрузить прогресс'],
])('shows %s', async (status, text) => {
	request.mockResolvedValue(response({ status }));
	render(view());
	await screen.findByText(text);
});
it('handles network error', async () => {
	request.mockRejectedValue(new Error('offline'));
	render(view());
	await screen.findByText('Не удалось загрузить прогресс');
});
it('clears state on logout and ignores late response after login as B', async () => {
	let resolve!: (value: unknown) => void;
	request.mockImplementationOnce(
		() =>
			new Promise((r) => {
				resolve = r;
			}),
	);
	const { rerender } = render(view());
	mockSession = null;
	mockAuthStatus = 'unauthenticated';
	rerender(view());
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
	mockSession = { user: { id: 'user-b' } };
	mockAuthStatus = 'authenticated';
	request.mockResolvedValue(response(result('user-b', 'profile-b', 1)));
	rerender(view());
	await screen.findByText('Вопрос изучен 1 из 3');
	await act(async () => {
		resolve(response(result()));
		await Promise.resolve();
	});
	expect(screen.queryByText('Вопрос изучен 2 из 3')).not.toBeInTheDocument();
});
it('revalidates profile on focus, clears old state, ignores the previous in-flight profile', async () => {
	const { unmount } = render(view());
	await screen.findByText('Вопрос изучен 2 из 3');
	let resolve!: (value: unknown) => void;
	request.mockImplementationOnce(
		() =>
			new Promise((r) => {
				resolve = r;
			}),
	);
	act(() => {
		window.dispatchEvent(new Event('focus'));
	});
	expect(screen.queryByText('Вопрос изучен 2 из 3')).not.toBeInTheDocument();
	request.mockResolvedValue(response(result('user-a', 'profile-b', 1)));
	act(() => {
		window.dispatchEvent(new Event('focus'));
	});
	await screen.findByText('Вопрос изучен 1 из 3');
	await act(async () => {
		resolve(response(result()));
		await Promise.resolve();
	});
	expect(screen.queryByText('Вопрос изучен 2 из 3')).not.toBeInTheDocument();
	unmount();
	const calls = request.mock.calls.length;
	window.dispatchEvent(new Event('focus'));
	expect(request).toHaveBeenCalledTimes(calls);
});
it('ignores previous question responses and rejects mismatched response identity', async () => {
	const { rerender } = render(view());
	await screen.findByText('Вопрос изучен 2 из 3');
	rerender(view(8));
	await screen.findByText('Не удалось загрузить прогресс');
	expect(screen.queryByText('Вопрос изучен 2 из 3')).not.toBeInTheDocument();
});
it('aborts and does not commit after unmount', async () => {
	request.mockImplementationOnce(() => new Promise(() => {}));
	const { unmount } = render(view());
	await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
	const signal = request.mock.calls[0][1].signal;
	unmount();
	expect(signal.aborted).toBe(true);
});

it('refuses a response for another signed-in user', async () => {
	request.mockResolvedValue(response(result('other-user')));
	render(view());
	await screen.findByText('Не удалось загрузить прогресс');
	expect(screen.queryByText('Вопрос изучен 2 из 3')).not.toBeInTheDocument();
});
it('hides a resolved result when session is replaced for the same user', async () => {
	const { rerender } = render(view());
	await screen.findByText('Вопрос изучен 2 из 3');
	request.mockImplementationOnce(() => new Promise(() => {}));
	mockSession = { user: { id: 'user-a' } };
	rerender(view());
	expect(screen.queryByText('Вопрос изучен 2 из 3')).not.toBeInTheDocument();
	expect(screen.getByTestId('progress-skeleton')).toBeInTheDocument();
});
it('drops hidden-tab state and reads the fresh profile after visibility returns', async () => {
	render(view());
	await screen.findByText('Вопрос изучен 2 из 3');
	const visibility = jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
	act(() => {
		document.dispatchEvent(new Event('visibilitychange'));
	});
	expect(screen.queryByText('Вопрос изучен 2 из 3')).not.toBeInTheDocument();
	visibility.mockReturnValue('visible');
	request.mockResolvedValue(response(result('user-a', 'new-profile', 1)));
	act(() => {
		document.dispatchEvent(new Event('visibilitychange'));
	});
	await screen.findByText('Вопрос изучен 1 из 3');
	visibility.mockRestore();
});

it('renders neutral guest HTML on the server without a private request', async () => {
	mockSession = null;
	mockAuthStatus = 'loading';
	const { renderToString } = await import('react-dom/server');
	expect(renderToString(view())).toBe('');
	expect(request).not.toHaveBeenCalled();
});

it.each([0, 1, 2, 3])('matches React progress segments for %s/3', async (count) => {
	request.mockResolvedValue(response(result('user-a', 'profile-a', count)));
	render(view());
	await screen.findByText(`Вопрос изучен ${count} из 3`);
	const bars = screen.getByRole('progressbar');
	expect(bars.children).toHaveLength(3);
	expect(bars.querySelectorAll('.progress-bar-item-checked')).toHaveLength(count);
	expect(bars.querySelectorAll('.progress-bar-item-large')).toHaveLength(count ? 1 : 0);
});
it('shares one request across desktop and drawer, including a late-mounted drawer', async () => {
	const both = (open: boolean) => (
		<NextIntlClientProvider locale="ru" messages={{ questions: messages }}>
			<QuestionPersonalStateProvider questionId={7}>
				<QuestionProgress />
				{open && <QuestionProgress inDrawer />}
			</QuestionPersonalStateProvider>
		</NextIntlClientProvider>
	);
	const { rerender } = render(both(false));
	await screen.findByText('Вопрос изучен 2 из 3');
	expect(request).toHaveBeenCalledTimes(1);
	rerender(both(true));
	expect(screen.getAllByText('Вопрос изучен 2 из 3')).toHaveLength(2);
	expect(request).toHaveBeenCalledTimes(1);
	expect(screen.getAllByRole('progressbar')).toHaveLength(2);
});
it('keeps public children for guest and clears both progress views on logout', async () => {
	const page = () => (
		<NextIntlClientProvider locale="ru" messages={{ questions: messages }}>
			<QuestionPersonalStateProvider questionId={7}>
				<article>Public answer</article>
				<QuestionProgress />
				<QuestionProgress inDrawer />
			</QuestionPersonalStateProvider>
		</NextIntlClientProvider>
	);
	const { rerender } = render(page());
	await screen.findAllByText('Вопрос изучен 2 из 3');
	mockSession = null;
	mockAuthStatus = 'unauthenticated';
	rerender(page());
	expect(screen.getByText('Public answer')).toBeInTheDocument();
	expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});

const favoriteView = (action: React.ComponentProps<typeof QuestionFavoriteActions>['action']) => (
	<NextIntlClientProvider locale="ru" messages={{ questions: messages }}>
		<QuestionPersonalStateProvider questionId={7}>
			<QuestionFavoriteActions action={action} />
		</QuestionPersonalStateProvider>
	</NextIntlClientProvider>
);
it('favorite waits for confirmation, blocks repeat clicks and supports removing then adding', async () => {
	request.mockResolvedValue(response({ ...result(), isVerified: true }));
	let resolve!: (value: unknown) => void;
	const action = jest.fn().mockImplementationOnce(
		() =>
			new Promise((r) => {
				resolve = r;
			}),
	);
	render(favoriteView(action));
	const button = await screen.findByRole('button', { name: 'Избранное' });
	await waitFor(() => expect(button).not.toBeDisabled());
	expect(button).toHaveAttribute('aria-pressed', 'true');
	fireEvent.click(button);
	fireEvent.click(button);
	expect(action).toHaveBeenCalledTimes(1);
	expect(button).toBeDisabled();
	expect(button).toHaveAttribute('aria-pressed', 'true');
	await act(async () => {
		resolve({ ...result(), isVerified: true, state: { ...result().state, isFavorite: false } });
		await Promise.resolve();
	});
	expect(button).toHaveAttribute('aria-pressed', 'false');
	action.mockResolvedValueOnce({ ...result(), isVerified: true });
	fireEvent.click(button);
	await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'true'));
	expect(action.mock.calls.map(([x]) => x.favorite)).toEqual([false, true]);
});
it('favorite guest/unverified email cannot mutate', async () => {
	mockSession = null;
	mockAuthStatus = 'unauthenticated';
	const action = jest.fn();
	const { rerender } = render(favoriteView(action));
	fireEvent.click(screen.getByRole('button', { name: 'Избранное' }));
	expect(request).not.toHaveBeenCalled();
	expect(action).not.toHaveBeenCalled();
	mockSession = { user: { id: 'user-a' } };
	mockAuthStatus = 'authenticated';
	request.mockResolvedValue(response({ ...result(), isVerified: false }));
	rerender(favoriteView(action));
	await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
	expect(screen.getByRole('button', { name: 'Избранное' })).toBeDisabled();
	expect(action).not.toHaveBeenCalled();
});
it('favorite errors keep the original state', async () => {
	request.mockResolvedValue(response({ ...result(), isVerified: true }));
	const action = jest.fn().mockResolvedValue({ status: 'error' });
	render(favoriteView(action));
	const button = screen.getByRole('button', { name: 'Избранное' });
	await waitFor(() => expect(button).not.toBeDisabled());
	fireEvent.click(button);
	await screen.findByText('Не удалось удалить из избранного');
	expect(button).toHaveAttribute('aria-pressed', 'true');
});
it('favorite ignores a late mutation after identity or profile replacement', async () => {
	request.mockResolvedValue(response({ ...result(), isVerified: true }));
	let resolve!: (value: unknown) => void;
	const action = jest.fn().mockImplementation(
		() =>
			new Promise((r) => {
				resolve = r;
			}),
	);
	const { rerender } = render(favoriteView(action));
	let button = screen.getByRole('button', { name: 'Избранное' });
	await waitFor(() => expect(button).not.toBeDisabled());
	fireEvent.click(button);
	mockSession = { user: { id: 'user-b' } };
	request.mockResolvedValue(response({ ...result('user-b', 'profile-b'), isVerified: true }));
	rerender(favoriteView(action));
	button = screen.getByRole('button', { name: 'Избранное' });
	await waitFor(() => expect(button).not.toBeDisabled());
	await act(async () => {
		resolve({ ...result(), isVerified: true, state: { ...result().state, isFavorite: false } });
		await Promise.resolve();
	});
	expect(button).toHaveAttribute('aria-pressed', 'true');
	fireEvent.click(button);
	request.mockResolvedValue(response({ ...result('user-b', 'profile-c'), isVerified: true }));
	fireEvent.focus(window);
	await waitFor(() => expect(button).not.toBeDisabled());
	await act(async () => {
		resolve({
			...result('user-b', 'profile-b'),
			isVerified: true,
			state: { ...result().state, isFavorite: false },
		});
		await Promise.resolve();
	});
	expect(button).toHaveAttribute('aria-pressed', 'true');
});

it('uses the React mobile link variant, icon and tooltip with guarded keyboard activation', async () => {
	mockMobile = true;
	request.mockResolvedValue(response({ ...result(), isVerified: true }));
	const action = jest.fn().mockResolvedValue({
		...result(),
		isVerified: true,
		state: { ...result().state, isFavorite: false },
	});
	render(favoriteView(action));
	const button = screen.getByRole('button', { name: 'Избранное' });
	await waitFor(() => expect(button).toHaveAttribute('aria-disabled', 'false'));
	expect(button.tagName).toBe('A');
	expect(button.querySelector('svg')).toHaveAttribute('width', '24');
	fireEvent.mouseEnter(button.parentElement!);
	await screen.findByRole('tooltip');
	expect(screen.getByRole('tooltip')).toHaveTextContent('Удалить из избранного');
	fireEvent.keyDown(button, { key: 'Enter' });
	await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'false'));
	expect(action).toHaveBeenCalledTimes(1);
});
