import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ProfileAccessBoundary, ProfileStatus } from './ProfileStatus';

const refresh = jest.fn();
const replace = jest.fn();
const update = jest.fn();
let session: {
	data: { requiresRefresh: boolean; user?: { id: string } } | null;
	status: 'authenticated' | 'unauthenticated' | 'loading';
};
const router = { refresh, replace };
jest.mock('@/shared/config', () => ({
	i18Namespace: { profile: 'profile' },
	ROUTES: { auth: { login: { page: '/auth/login' } } },
	useRouter: () => router,
}));
jest.mock('next-auth/react', () => ({ useSession: () => ({ ...session, update }) }));
jest.mock('next-intl', () => ({
	useTranslations: () => {
		const { createTranslator } = jest.requireActual('next-intl');
		return createTranslator({
			locale: 'ru',
			messages: jest.requireActual('public/locales/ru/profile.json'),
		});
	},
}));
beforeEach(() => {
	refresh.mockReset();
	replace.mockReset();
	update.mockReset();
	session = { data: { requiresRefresh: true }, status: 'authenticated' };
});
it('shows a loading state without private data or requests', () => {
	render(<ProfileStatus kind="loading" />);
	expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
	expect(screen.queryByRole('button')).not.toBeInTheDocument();
	expect(update).not.toHaveBeenCalled();
});
it.each(['error', 'no-active-profile'] as const)('offers a read-only retry for %s', (kind) => {
	const reset = jest.fn();
	render(<ProfileStatus kind={kind} onRetry={reset} />);
	fireEvent.click(screen.getByRole('button', { name: 'Повторить попытку' }));
	expect(reset).toHaveBeenCalledTimes(1);
	expect(refresh).toHaveBeenCalledTimes(1);
	expect(update).not.toHaveBeenCalled();
});
it('waits for the existing provider and refreshes RSC only once after success', () => {
	const { rerender } = render(<ProfileStatus kind="refresh-required" />);
	expect(update).not.toHaveBeenCalled();
	expect(refresh).not.toHaveBeenCalled();
	session = { data: { requiresRefresh: false }, status: 'authenticated' };
	rerender(<ProfileStatus kind="refresh-required" />);
	rerender(<ProfileStatus kind="refresh-required" />);
	expect(refresh).toHaveBeenCalledTimes(1);
	expect(update).not.toHaveBeenCalled();
});
it('allows one explicit writable retry without credentials and prevents parallel requests', async () => {
	let finish: ((value: { requiresRefresh: boolean }) => void) | undefined;
	update.mockImplementation(
		() =>
			new Promise((resolve) => {
				finish = resolve;
			}),
	);
	render(<ProfileStatus kind="refresh-required" />);
	const button = screen.getByRole('button', { name: 'Повторить попытку' });
	fireEvent.click(button);
	fireEvent.click(button);
	expect(update).toHaveBeenCalledTimes(1);
	expect(update).toHaveBeenCalledWith({});
	await act(async () => {
		finish?.({ requiresRefresh: false });
		await Promise.resolve();
	});
	expect(refresh).toHaveBeenCalledTimes(1);
});
it('keeps a temporary failure visible without a retry loop', async () => {
	update.mockRejectedValue(new Error('hidden diagnostic'));
	const { rerender } = render(<ProfileStatus kind="refresh-required" />);
	fireEvent.click(screen.getByRole('button'));
	await screen.findByRole('alert');
	rerender(<ProfileStatus kind="refresh-required" />);
	expect(update).toHaveBeenCalledTimes(1);
	expect(refresh).not.toHaveBeenCalled();
	expect(screen.queryByText('hidden diagnostic')).not.toBeInTheDocument();
});
it('routes an expired session to local login', () => {
	session = { data: null, status: 'unauthenticated' };
	render(<ProfileStatus kind="refresh-required" />);
	expect(replace).toHaveBeenCalledWith('/auth/login');
});
it('routes a null writable result to login instead of showing a profile', async () => {
	update.mockResolvedValue(null);
	render(<ProfileStatus kind="refresh-required" />);
	fireEvent.click(screen.getByRole('button'));
	await waitFor(() => expect(replace).toHaveBeenCalledWith('/auth/login'));
});

it('hides private content as soon as session becomes unauthenticated', () => {
	session = { data: null, status: 'unauthenticated' };
	render(
		<ProfileAccessBoundary userId="user">
			<div>Private profile</div>
		</ProfileAccessBoundary>,
	);
	expect(screen.queryByText('Private profile')).not.toBeInTheDocument();
	expect(replace).toHaveBeenCalledWith('/auth/login');
});
it('hides the old user profile and refreshes once when identity changes', () => {
	session = { data: { requiresRefresh: false, user: { id: 'new-user' } }, status: 'authenticated' };
	const { rerender } = render(
		<ProfileAccessBoundary userId="old-user">
			<div>Old private profile</div>
		</ProfileAccessBoundary>,
	);
	rerender(
		<ProfileAccessBoundary userId="old-user">
			<div>Old private profile</div>
		</ProfileAccessBoundary>,
	);
	expect(screen.queryByText('Old private profile')).not.toBeInTheDocument();
	expect(refresh).toHaveBeenCalledTimes(1);
});
it('waits during session loading and reveals only a matching identity', () => {
	session = { data: null, status: 'loading' };
	const { rerender } = render(
		<ProfileAccessBoundary userId="user">
			<div>Verified profile</div>
		</ProfileAccessBoundary>,
	);
	expect(screen.queryByText('Verified profile')).not.toBeInTheDocument();
	session = { data: { requiresRefresh: false, user: { id: 'user' } }, status: 'authenticated' };
	rerender(
		<ProfileAccessBoundary userId="user">
			<div>Verified profile</div>
		</ProfileAccessBoundary>,
	);
	expect(screen.getByText('Verified profile')).toBeInTheDocument();
	expect(refresh).not.toHaveBeenCalled();
});
