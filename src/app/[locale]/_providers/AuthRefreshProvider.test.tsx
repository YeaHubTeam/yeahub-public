/** @jest-environment jsdom */
import { Children, StrictMode, cloneElement, isValidElement, useEffect, useRef } from 'react';
import type { ReactElement, ReactNode } from 'react';

import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { getSession, useSession } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';

import type { HeaderProfileResult } from '@/entities/profile';
import { useAvatarState } from '@/entities/profile';
import { AvatarEditor } from '@/features/profile/avatar';
import { Header } from '@/widgets/Header';

import { ProfileAccessBoundary } from '../_ui/ProfilePage/ProfileStatus';
import { AuthRefreshProvider } from './AuthRefreshProvider';

const avatarRefresh = jest.fn();
jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config/i18n/i18nTranslations'),
	i18Namespace: {
		profile: 'profile',
		header: 'header',
		translation: 'translation',
		subscription: 'subscription',
	},
	ROUTES: {
		profile: { page: '/profile' },
		auth: { login: { page: '/auth/login' } },
		questions: { page: '/questions/:specialization' },
		collections: { page: '/collections/:specialization' },
		tasks: { page: '/tasks' },
		quiz: { new: { page: '/quiz/new' } },
		resources: { page: '/resources/:specialization' },
		mentor: { page: '/mentor' },
		'mentor-fullstack': { page: '/mentor-fullstack' },
		'mentor-worldwide': { page: '/mentor-worldwide' },
		hhAnalytics: { page: '/hh-analytics' },
		vacancies: { page: '/vacancies/:specialization' },
	},
	useRouter: () => ({ refresh: avatarRefresh, replace: jest.fn(), push: jest.fn() }),
}));
jest.mock('next/navigation', () => ({
	usePathname: () => '/ru/profile',
	useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: avatarRefresh }),
}));
jest.mock('next-intl', () => ({
	...jest.requireActual('next-intl'),
	useTranslations: (namespace: string) =>
		jest.requireActual('next-intl').createTranslator({
			locale: 'ru',
			messages: jest.requireActual(`public/locales/ru/${namespace}.json`),
		}),
}));
jest.mock('react-cropper', () => {
	const React = jest.requireActual<typeof import('react')>('react');
	const Mock = React.forwardRef<unknown, { src: string; crop: () => void }>(
		({ src, crop }, ref) => {
			React.useImperativeHandle(ref, () => ({
				cropper: { getCroppedCanvas: () => ({ toDataURL: () => 'data:image/png;base64,cG5n' }) },
			}));
			const previousRef = React.useRef('');
			React.useEffect(() => {
				if (previousRef.current !== src) {
					previousRef.current = src;
					crop();
				}
			}, [src, crop]);
			return <div data-testid="avatar-cropper" />;
		},
	);
	Mock.displayName = 'Cropper';
	return { Cropper: Mock };
});

const validSession = (requiresRefresh: boolean) => ({
	user: { id: 'synthetic-user', username: 'sample', image: null as string | null },
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
	headerRead.mockReset();
	headerRead.mockImplementation(() =>
		Promise.resolve(
			current
				? {
						status: 'success',
						profile: {
							userId: current.user.id,
							username: current.user.username,
							email: null,
							avatarUrl: current.user.image,
						},
					}
				: { status: 'unauthenticated' },
		),
	);
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
afterEach(async () => {
	await act(async () => {
		for (let i = 0; i < 20; i++) await Promise.resolve();
	});
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

// Obtain the real client session slot from Header's public composition, without importing widget internals.
const headerRead = jest.fn<Promise<HeaderProfileResult>, []>();
const HeaderSessionView = () => {
	const find = (
		node: ReactNode,
	): ReactElement<{ desktopGuest?: ReactNode; children?: ReactNode }> | undefined => {
		if (!isValidElement<{ desktopGuest?: ReactNode; children?: ReactNode }>(node)) return undefined;
		if ('desktopGuest' in node.props) return node;
		return Children.toArray(node.props.children).map(find).find(Boolean);
	};
	const slot = find(Header({ loadHeaderProfileAction: headerRead }));
	if (!slot) throw new Error('Header session slot missing');
	return cloneElement(slot, { desktopGuest: <span>Guest</span> });
};
const avatarSource = 'https://images.example/avatar-before.png';
const avatarTarget = 'https://images.example/avatar-after.png';
const sessionWithImage = (image: string | null) => ({
	...validSession(false),
	user: { ...validSession(false).user, image },
});
const changeImage = async (container: HTMLElement) => {
	fireEvent.change(container.querySelector('input[type="file"]')!, {
		target: { files: [new File(['image'], 'photo.png', { type: 'image/png' })] },
	});
	await screen.findByTestId('avatar-cropper');
	await waitFor(() =>
		expect(screen.getByRole('button', { name: 'Сохранить изменения' })).toBeEnabled(),
	);
	fireEvent.click(screen.getByRole('button', { name: 'Сохранить изменения' }));
};
let profileMounts = 0;
const ProfileDraft = () => {
	const methods = useForm<{ draft: string }>({ defaultValues: { draft: '' } });
	useEffect(() => {
		profileMounts++;
	}, []);
	return (
		<FormProvider {...methods}>
			<input aria-label="Unrelated draft" {...methods.register('draft')} />
		</FormProvider>
	);
};
const AvatarAndHeader = ({
	image,
	action,
	editorKey = 'profile',
}: {
	image: string | null;
	editorKey?: string;
	action: import('@/features/profile/avatar').AvatarAction;
}) => (
	<NextIntlClientProvider locale="ru" messages={{}}>
		<AuthRefreshProvider>
			<div data-testid="real-header">
				<HeaderSessionView />
			</div>
			<ProfileAccessBoundary userId="synthetic-user">
				<ProfileDraft />
				<Probe />
				<AvatarEditor key={editorKey} image={image} avatarAction={action} variant="profile-edit" />
			</ProfileAccessBoundary>
		</AuthRefreshProvider>
	</NextIntlClientProvider>
);
const headerImages = () =>
	within(screen.getByTestId('real-header')).queryAllByRole('img', { name: 'Аватар' });

const expectHeaderAvatar = async (url: string | null) => {
	await waitFor(() => {
		expect(headerImages()).toHaveLength(url ? 2 : 0);
		if (url) for (const image of headerImages()) expect(image).toHaveAttribute('src', url);
		else
			expect(
				within(screen.getByTestId('real-header')).getAllByTestId('AvatarWithoutPhoto_Wrapper'),
			).toHaveLength(2);
	});
	expect(screen.queryByRole('status')).toBeNull();
	expect(screen.queryByText('Фотография профиля обновлена.')).toBeNull();
};

describe('shared avatar state with real Header and SessionProvider', () => {
	beforeEach(() => {
		current = sessionWithImage(avatarSource);
		next = current;
		avatarRefresh.mockClear();
		profileMounts = 0;
		jest.spyOn(window, 'Image').mockImplementation(() => {
			const image = document.createElement('img');
			Object.defineProperty(image, 'naturalWidth', { value: 512 });
			Object.defineProperty(image, 'naturalHeight', { value: 512 });
			Object.defineProperty(image, 'src', {
				set: () => queueMicrotask(() => image.dispatchEvent(new Event('load'))),
			});
			return image;
		});
	});
	it.each(['add', 'replace', 'delete'] as const)(
		'updates Header on %s with no auth IO, remount or draft loss',
		async (operation) => {
			const initial = operation === 'add' ? null : avatarSource;
			current = sessionWithImage(initial);
			const target = operation === 'delete' ? null : avatarTarget;
			const action = jest.fn().mockResolvedValue({ status: 'success', avatarUrl: target });
			const view = render(<AvatarAndHeader image={initial} action={action} />);
			await waitFor(() => expect(screen.getByLabelText('Unrelated draft')).toBeInTheDocument());
			const draft = screen.getByLabelText('Unrelated draft');
			fireEvent.change(draft, { target: { value: 'keep draft' } });
			const before = calls.mock.calls.length;
			if (operation === 'delete')
				fireEvent.click(screen.getByRole('button', { name: 'Удалить фото' }));
			else await changeImage(view.container);
			await expectHeaderAvatar(target);
			if (target) for (const image of headerImages()) expect(image).toHaveAttribute('src', target);
			expect(headerImages()).toHaveLength(target ? 2 : 0);
			expect(action).toHaveBeenCalledTimes(1);
			expect(calls).toHaveBeenCalledTimes(before);
			expect(posts()).toHaveLength(0);
			expect(profileMounts).toBe(1);
			expect(screen.getByLabelText('Unrelated draft')).toBe(draft);
			expect(draft).toHaveValue('keep draft');
			expect(avatarRefresh).not.toHaveBeenCalled();
			expect(screen.queryByText(/Аватар мог быть изменён/)).toBeNull();
		},
	);
	it('does not publish a backend failure', async () => {
		const action = jest.fn().mockResolvedValue({ status: 'error' });
		render(<AvatarAndHeader image={avatarSource} action={action} />);
		await waitFor(() => expect(headerImages()).toHaveLength(2));
		const before = calls.mock.calls.length;
		fireEvent.click(screen.getByRole('button', { name: 'Удалить фото' }));
		await screen.findByRole('alert');
		for (const image of headerImages()) expect(image).toHaveAttribute('src', avatarSource);
		expect(calls).toHaveBeenCalledTimes(before);
		expect(action).toHaveBeenCalledTimes(1);
	});
	it('falls back after image load failure and retries for a new confirmed URL', async () => {
		const action = jest.fn().mockResolvedValue({ status: 'success', avatarUrl: avatarTarget });
		const view = render(<AvatarAndHeader image={avatarSource} action={action} />);
		await waitFor(() => expect(headerImages()).toHaveLength(2));
		for (const image of headerImages()) fireEvent.error(image);
		expect(headerImages()).toHaveLength(0);
		await changeImage(view.container);
		await expectHeaderAvatar(avatarTarget);
		expect(headerImages()).toHaveLength(2);
		for (const image of headerImages()) expect(image).toHaveAttribute('src', avatarTarget);
	});
	it.each(['logout', 'identity'] as const)(
		'discards an override and ignores late results after %s',
		async (outcome) => {
			let finish!: (value: { status: 'success'; avatarUrl: string | null }) => void;
			const action = jest
				.fn()
				.mockResolvedValueOnce({ status: 'success', avatarUrl: avatarTarget })
				.mockImplementationOnce(
					() =>
						new Promise((resolve) => {
							finish = resolve;
						}),
				);
			render(<AvatarAndHeader image={avatarSource} action={action} />);
			await waitFor(() => expect(headerImages()).toHaveLength(2));
			fireEvent.click(screen.getByRole('button', { name: 'Удалить фото' }));
			await expectHeaderAvatar(avatarTarget);
			fireEvent.click(screen.getByRole('button', { name: 'Удалить фото' }));
			await waitFor(() => expect(finish).toBeDefined());
			current =
				outcome === 'logout'
					? null
					: {
							...sessionWithImage(avatarSource),
							user: { ...validSession(false).user, id: 'other-user', image: avatarSource },
						};
			// Simulate an independent auth event, not avatar synchronization.
			await act(async () => {
				await getSession();
			});
			await waitFor(() => expect(screen.queryByLabelText('Unrelated draft')).toBeNull());
			await act(async () => {
				finish({ status: 'success', avatarUrl: avatarTarget });
				await Promise.resolve();
			});
			if (outcome === 'logout') expect(headerImages()).toHaveLength(0);
			else for (const image of headerImages()) expect(image).toHaveAttribute('src', avatarSource);
			current = sessionWithImage(avatarSource);
			await act(async () => {
				await getSession();
			});
			await waitFor(() => expect(screen.getByLabelText('Unrelated draft')).toBeInTheDocument());
			for (const image of headerImages()) expect(image).toHaveAttribute('src', avatarSource);
			expect(action).toHaveBeenCalledTimes(2);
		},
	);
	it('keeps the shared image when navigating to a newly mounted editor with stale props', async () => {
		const action = jest.fn().mockResolvedValue({ status: 'success', avatarUrl: avatarTarget });
		const view = render(<AvatarAndHeader image={avatarSource} action={action} />);
		await waitFor(() => expect(headerImages()).toHaveLength(2));
		fireEvent.click(screen.getByRole('button', { name: 'Удалить фото' }));
		await expectHeaderAvatar(avatarTarget);
		const before = calls.mock.calls.length;
		view.rerender(<AvatarAndHeader image={avatarSource} action={action} editorKey="edit" />);
		expect(screen.getByRole('img', { name: 'Фото профиля' })).toHaveAttribute('src', avatarTarget);
		for (const image of headerImages()) expect(image).toHaveAttribute('src', avatarTarget);
		expect(calls).toHaveBeenCalledTimes(before);
		expect(action).toHaveBeenCalledTimes(1);
	});
	it('reads backend null after provider remount despite a stale session image', async () => {
		const action = jest.fn().mockResolvedValue({ status: 'success', avatarUrl: null });
		const view = render(<AvatarAndHeader image={avatarSource} action={action} />);
		await waitFor(() => expect(headerImages()).toHaveLength(2));
		fireEvent.click(screen.getByRole('button', { name: 'Удалить фото' }));
		await expectHeaderAvatar(null);
		view.unmount();
		headerRead.mockResolvedValue({
			status: 'success',
			profile: { userId: 'synthetic-user', avatarUrl: null, username: 'Backend name', email: null },
		});
		render(<AvatarAndHeader image={null} action={action} />);
		await waitFor(() => expect(headerRead).toHaveBeenCalledTimes(2));
		await expectHeaderAvatar(null);
		expect(current?.user.image).toBe(avatarSource);
	});
});

const AvatarRace = () => {
	const { value, beginChange } = useAvatarState();
	const first = useRef<((url: string | null) => boolean) | null>(null);
	return (
		<>
			<button
				onClick={() => {
					first.current = beginChange('synthetic-user');
				}}
			>
				Start old
			</button>
			<button
				onClick={() => {
					beginChange('synthetic-user')(avatarTarget);
				}}
			>
				Commit new
			</button>
			<button
				onClick={() => {
					first.current?.(avatarSource);
				}}
			>
				Commit old
			</button>
			<span data-testid="override">{value?.avatarUrl}</span>
		</>
	);
};
it('rejects an older completion after a newer operation has started', async () => {
	current = sessionWithImage(avatarSource);
	render(
		<AuthRefreshProvider>
			<AvatarRace />
		</AuthRefreshProvider>,
	);
	// Wait for the provider's trusted identity before starting changes.
	await act(async () => {
		for (let i = 0; i < 20; i++) await Promise.resolve();
	});
	fireEvent.click(screen.getByText('Start old'));
	fireEvent.click(screen.getByText('Commit new'));
	fireEvent.click(screen.getByText('Commit old'));
	expect(screen.getByTestId('override')).toHaveTextContent(avatarTarget);
});

const headerProfile = (
	avatarUrl: string | null,
	userId = 'synthetic-user',
): HeaderProfileResult => ({
	status: 'success',
	profile: { userId, avatarUrl, username: 'Backend name', email: 'synthetic@example.invalid' },
});
const HeaderOnly = () => (
	<NextIntlClientProvider locale="ru" messages={{}}>
		<AuthRefreshProvider>
			<div data-testid="real-header">
				<HeaderSessionView />
			</div>
			<ProfileDraft />
		</AuthRefreshProvider>
	</NextIntlClientProvider>
);
describe('Header backend initialization independent of Auth.js image', () => {
	beforeEach(() => {
		current = sessionWithImage(avatarSource);
		next = current;
		profileMounts = 0;
	});
	it('shows fallback until backend data arrives and uses backend username/email without resetting draft', async () => {
		let finish!: (value: HeaderProfileResult) => void;
		headerRead.mockImplementation(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				}),
		);
		render(<HeaderOnly />);
		await waitFor(() => expect(headerRead).toHaveBeenCalledTimes(1));
		expect(headerImages()).toHaveLength(0);
		expect(screen.queryByText('sample')).toBeNull();
		const draft = screen.getByLabelText('Unrelated draft');
		fireEvent.change(draft, { target: { value: 'keep' } });
		await act(async () => {
			finish(headerProfile(avatarTarget));
			await Promise.resolve();
		});
		await expectHeaderAvatar(avatarTarget);
		expect(screen.getAllByText('Backend name').length).toBeGreaterThan(0);
		fireEvent.click(
			within(screen.getByTestId('real-header')).getByRole('button', { expanded: false }),
		);
		expect(await screen.findByText('synthetic@example.invalid')).toBeInTheDocument();
		expect(screen.getByLabelText('Unrelated draft')).toBe(draft);
		expect(draft).toHaveValue('keep');
		expect(profileMounts).toBe(1);
		expect(headerRead).toHaveBeenCalledWith();
		expect(posts()).toHaveLength(0);
	});
	it('does not reread on ordinary renders or StrictMode effect replay', async () => {
		headerRead.mockResolvedValue(headerProfile(avatarTarget));
		const view = render(
			<StrictMode>
				<HeaderOnly />
			</StrictMode>,
		);
		await expectHeaderAvatar(avatarTarget);
		view.rerender(
			<StrictMode>
				<HeaderOnly />
			</StrictMode>,
		);
		await act(async () => {
			await Promise.resolve();
		});
		expect(headerRead).toHaveBeenCalledTimes(1);
	});
	it.each([
		'error',
		'unauthenticated',
		'forbidden',
		'refresh-required',
		'identity-mismatch',
		'rejection',
	] as const)(
		'keeps the page and fallback on %s without retries or session writes',
		async (outcome) => {
			if (outcome === 'rejection') headerRead.mockRejectedValue(new Error('synthetic failure'));
			else headerRead.mockResolvedValue({ status: outcome });
			render(<HeaderOnly />);
			await waitFor(() => expect(headerRead).toHaveBeenCalledTimes(1));
			await act(async () => {
				for (let i = 0; i < 10; i++) await Promise.resolve();
			});
			expect(headerImages()).toHaveLength(0);
			expect(screen.getByLabelText('Unrelated draft')).toBeInTheDocument();
			expect(headerRead).toHaveBeenCalledTimes(1);
			expect(posts()).toHaveLength(0);
			expect(screen.queryByText('Guest')).toBeNull();
		},
	);
	it('does not load for guests', async () => {
		current = null;
		render(<HeaderOnly />);
		await screen.findByText('Guest');
		expect(headerRead).not.toHaveBeenCalled();
	});
	it('ignores a response with another identity', async () => {
		headerRead.mockResolvedValue(headerProfile(avatarTarget, 'other-user'));
		render(<HeaderOnly />);
		await waitFor(() => expect(headerRead).toHaveBeenCalledTimes(1));
		await act(async () => {
			await Promise.resolve();
		});
		expect(headerImages()).toHaveLength(0);
		expect(screen.queryByText('Backend name')).toBeNull();
	});
	it.each([avatarTarget, null])(
		'keeps a confirmed PATCH over a late initial GET: %#',
		async (target) => {
			let finish!: (value: HeaderProfileResult) => void;
			headerRead.mockImplementation(
				() =>
					new Promise((resolve) => {
						finish = resolve;
					}),
			);
			const action = jest.fn().mockResolvedValue({ status: 'success', avatarUrl: target });
			render(<AvatarAndHeader image={avatarSource} action={action} />);
			await waitFor(() => expect(headerRead).toHaveBeenCalledTimes(1));
			const draft = screen.getByLabelText('Unrelated draft');
			fireEvent.change(draft, { target: { value: 'unsaved' } });
			const before = calls.mock.calls.length;
			fireEvent.click(screen.getByRole('button', { name: 'Удалить фото' }));
			await waitFor(() =>
				expect(screen.getByRole('button', { name: 'Выберите фотографию' })).toBeEnabled(),
			);
			await expectHeaderAvatar(target);
			await act(async () => {
				finish(headerProfile(avatarSource));
				await Promise.resolve();
			});
			await expectHeaderAvatar(target);
			expect(screen.getByLabelText('Unrelated draft')).toBe(draft);
			expect(draft).toHaveValue('unsaved');
			expect(profileMounts).toBe(1);
			expect(action).toHaveBeenCalledTimes(1);
			expect(calls).toHaveBeenCalledTimes(before);
			expect(headerRead).toHaveBeenCalledTimes(1);
		},
	);
	it('rejects old A and B responses after A → B → A, then clears data on logout', async () => {
		const responses: Array<(value: HeaderProfileResult) => void> = [];
		headerRead.mockImplementation(
			() =>
				new Promise((resolve) => {
					responses.push(resolve);
				}),
		);
		render(<HeaderOnly />);
		await waitFor(() => expect(responses).toHaveLength(1));
		current = {
			...sessionWithImage(avatarSource),
			user: { ...validSession(false).user, id: 'user-b', image: avatarSource },
		};
		await act(async () => {
			await getSession();
		});
		await waitFor(() => expect(responses).toHaveLength(2));
		current = sessionWithImage(avatarSource);
		await act(async () => {
			await getSession();
		});
		await waitFor(() => expect(responses).toHaveLength(3));
		await act(async () => {
			responses[0](headerProfile(avatarSource));
			responses[1](headerProfile(avatarSource, 'user-b'));
			await Promise.resolve();
		});
		expect(headerImages()).toHaveLength(0);
		expect(screen.queryByText('Backend name')).toBeNull();
		await act(async () => {
			responses[2](headerProfile(avatarTarget));
			await Promise.resolve();
		});
		await expectHeaderAvatar(avatarTarget);
		current = null;
		await act(async () => {
			await getSession();
		});
		await screen.findByText('Guest');
		expect(headerImages()).toHaveLength(0);
		expect(screen.queryByText('Backend name')).toBeNull();
		expect(headerRead).toHaveBeenCalledTimes(3);
	});
	it('ignores a pending read after unmount', async () => {
		let finish!: (value: HeaderProfileResult) => void;
		headerRead.mockImplementation(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				}),
		);
		const view = render(<HeaderOnly />);
		await waitFor(() => expect(headerRead).toHaveBeenCalledTimes(1));
		view.unmount();
		await act(async () => {
			finish(headerProfile(avatarTarget));
			await Promise.resolve();
		});
		expect(screen.queryByText('Backend name')).toBeNull();
		expect(headerRead).toHaveBeenCalledTimes(1);
	});
});
