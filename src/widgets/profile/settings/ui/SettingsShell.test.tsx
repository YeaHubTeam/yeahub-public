import type { ComponentProps } from 'react';

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider as IntlProvider } from 'next-intl';

import header from '../../../../../public/locales/ru/header.json';
import profile from '../../../../../public/locales/ru/profile.json';
import subscription from '../../../../../public/locales/ru/subscription.json';
import translation from '../../../../../public/locales/ru/translation.json';
import user from '../../../../../public/locales/ru/user.json';
import { SettingsShell } from '../index';

const NextIntlClientProvider = (props: ComponentProps<typeof IntlProvider>) => (
	<IntlProvider {...props} messages={{ subscription, translation, ...props.messages }} />
);

jest.mock('@/shared/assets/images/multyProfile.png', () => ({
	src: '/multyProfile.png',
	width: 96,
	height: 96,
}));

const push = jest.fn();
const localizedPush = jest.fn();
const refresh = jest.fn();
const replace = jest.fn();
const signOut = jest.fn();
let historyIdentity: string | null = 'history-owner';
jest.mock('next-auth/react', () => ({
	signOut: (...args: unknown[]) => signOut(...args),
	useSession: () => ({
		data: historyIdentity ? { user: { id: historyIdentity } } : null,
		status: historyIdentity ? 'authenticated' : 'unauthenticated',
	}),
}));

const settingsRouter = {
	replace,
	refresh,
	push: (href: string) => {
		push(href);
		localizedPush(
			jest.requireActual('@/shared/config/navigation').getPathname({ locale: 'ru', href }),
		);
	},
};
jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config'),
	useRouter: () => settingsRouter,
}));

const ids = ['select-tariff', 'change-password', 'email-verify', 'account'];
const labels = ['Выбрать тариф', 'Смена пароля', 'Верификация', 'Аккаунт'];
const mount = () =>
	render(
		<NextIntlClientProvider locale="ru" messages={{ profile, header }}>
			<SettingsShell />
		</NextIntlClientProvider>,
	);
const selected = (index: number) =>
	expect(screen.getByRole('tab', { name: labels[index] })).toHaveAttribute('aria-selected', 'true');

beforeEach(() => window.history.replaceState(null, '', '/ru/settings'));

test('renders localized tabs in React order and a neutral default panel', () => {
	mount();
	expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(labels);
	selected(0);
	expect(screen.getByRole('tabpanel')).toBeEmptyDOMElement();
	expect(screen.queryByRole('heading')).not.toBeInTheDocument();
	expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test.each(ids)('opens the direct hash %s', (id) => {
	window.history.replaceState(null, '', `/ru/settings#${id}`);
	mount();
	selected(ids.indexOf(id));
});

test('replaces hash, preserves locale/query/state, and unmounts the old panel', () => {
	window.history.replaceState({ marker: true }, '', '/ru/settings?test=1');
	mount();
	const oldPanel = screen.getByRole('tabpanel');
	const length = window.history.length;
	fireEvent.click(screen.getByRole('tab', { name: labels[2] }));
	selected(2);
	expect(window.location.pathname + window.location.search + window.location.hash).toBe(
		'/ru/settings?test=1#email-verify',
	);
	expect(window.history.state).toEqual({ marker: true });
	expect(window.history.length).toBe(length);
	expect(oldPanel).not.toBeInTheDocument();
	expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
});

test('synchronizes actual Back and Forward traversal', async () => {
	window.history.replaceState(null, '', '/ru/settings#select-tariff');
	window.history.pushState(null, '', '/ru/settings#account');
	mount();
	selected(3);
	act(() => {
		window.history.back();
	});
	await waitFor(() => selected(0));
	act(() => {
		window.history.forward();
	});
	await waitFor(() => selected(3));
});

test('unknown hashes select tariffs without rewriting the URL', () => {
	window.history.replaceState(null, '', '/ru/settings#unknown');
	mount();
	selected(0);
	expect(window.location.hash).toBe('#unknown');
	fireEvent.click(screen.getByRole('tab', { name: labels[1] }));
	act(() => {
		window.history.replaceState(null, '', '/ru/settings#other');
		window.dispatchEvent(new HashChangeEvent('hashchange'));
	});
	selected(0);
	expect(window.location.hash).toBe('#other');
});

test('supports keyboard tab selection and focus', () => {
	mount();
	const first = screen.getByRole('tab', { name: labels[0] });
	first.focus();
	fireEvent.keyDown(first, { key: 'ArrowRight' });
	selected(1);
	expect(screen.getByRole('tab', { name: labels[1] })).toHaveFocus();
	fireEvent.keyDown(document.activeElement!, { key: 'End' });
	selected(3);
	fireEvent.keyDown(document.activeElement!, { key: 'Home' });
	selected(0);
});

test('does not request business data and cleans up navigation listeners', () => {
	const fetchMock = jest.fn();
	const originalFetch = global.fetch;
	global.fetch = fetchMock;
	const remove = jest.spyOn(window, 'removeEventListener');
	const { unmount } = mount();
	ids.forEach((_, index) => fireEvent.click(screen.getByRole('tab', { name: labels[index] })));
	expect(fetchMock).not.toHaveBeenCalled();
	unmount();
	expect(remove).toHaveBeenCalledWith('hashchange', expect.any(Function));
	expect(remove).toHaveBeenCalledWith('popstate', expect.any(Function));
	global.fetch = originalFetch;
	remove.mockRestore();
});

test('mounts the password form only on its hash and follows Back/Forward without mutation', async () => {
	window.history.replaceState(null, '', '/ru/settings#select-tariff');
	window.history.pushState(null, '', '/ru/settings#change-password');
	const action = jest.fn();
	render(
		<NextIntlClientProvider locale="ru" messages={{ profile, header, translation }}>
			<SettingsShell passwordAction={action} />
		</NextIntlClientProvider>,
	);
	expect(screen.getByText('Сменить пароль')).toBeInTheDocument();
	act(() => window.history.back());
	await waitFor(() => expect(screen.queryByText('Сменить пароль')).not.toBeInTheDocument());
	act(() => window.history.forward());
	await waitFor(() => expect(screen.getByText('Сменить пароль')).toBeInTheDocument());
	expect(action).not.toHaveBeenCalled();
});

test('renders read-only account data only in the account tab without invoking mutations', () => {
	const send = jest.fn();
	const read = jest.fn();
	const password = jest.fn();
	render(
		<NextIntlClientProvider locale="ru" messages={{ profile, header, translation }}>
			<SettingsShell
				passwordAction={password}
				emailVerification={{
					email: 'synthetic@example.invalid',
					isVerified: true,
					actions: { send, read },
				}}
				account={{
					hasPremiumAccess: true,
					profiles: [{ id: 'one', specializationId: 0, isActive: true, specializationTitle: null }],
				}}
			/>
		</NextIntlClientProvider>,
	);
	expect(screen.queryByText('Ваши профили')).not.toBeInTheDocument();
	fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
	expect(screen.getByText('Ваши профили')).toBeInTheDocument();
	expect(screen.getByText('1/10')).toBeInTheDocument();
	expect(screen.getByRole('tabpanel').querySelectorAll('button')).toHaveLength(1);
	expect(screen.getByRole('button', { name: 'Как сменить специализацию' })).toBeInTheDocument();
	fireEvent.click(screen.getByRole('tab', { name: 'Верификация' }));
	expect(screen.queryByText('Ваши профили')).not.toBeInTheDocument();
	expect(send).not.toHaveBeenCalled();
	expect(read).not.toHaveBeenCalled();
	expect(password).not.toHaveBeenCalled();
	fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
	expect(screen.getByText('1/10')).toBeInTheDocument();
});

const accountData = {
	hasPremiumAccess: false,
	profiles: [
		{ id: 'other', specializationId: 2, isActive: false, specializationTitle: 'Backend' },
		{ id: 'active', specializationId: 1, isActive: true, specializationTitle: 'Frontend' },
	],
};
const operations = () => ({
	select: jest.fn().mockResolvedValue({ status: 'success', href: '/questions/backend' }),
	create: jest.fn().mockResolvedValue({ status: 'success', href: '/profile/edit' }),
});
const interactive = (actions = operations(), account = accountData) => {
	window.history.replaceState(null, '', '/ru/settings#account');
	const view = render(
		<NextIntlClientProvider locale="ru" messages={{ profile, header, translation }}>
			<SettingsShell account={account} profileActions={actions} />
		</NextIntlClientProvider>,
	);
	return { ...view, actions };
};
const deferred = <T,>() => {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((done) => {
		resolve = done;
	});
	return { promise, resolve };
};
test.each([
	['Выбрать профиль: Backend', 'other'],
	['Выбрать профиль: Frontend', 'active'],
	['Перейти', 'active'],
])('selects via %s and navigates only by the confirmed action href', async (name, id) => {
	const { actions } = interactive();
	fireEvent.click(screen.getByRole('button', { name }));
	await waitFor(() => expect(push).toHaveBeenCalledWith('/questions/backend'));
	expect(actions.select).toHaveBeenCalledTimes(1);
	expect(actions.select).toHaveBeenCalledWith(id);
	expect(actions.create).not.toHaveBeenCalled();
	expect(screen.getByRole('status')).toHaveTextContent('Профиль готов');
});
test('selects an unfinished profile and follows the edit href', async () => {
	const actions = operations();
	actions.select.mockResolvedValue({ status: 'success', href: '/profile/edit' });
	interactive(actions, {
		...accountData,
		profiles: [{ id: 'empty', specializationId: 0, isActive: false, specializationTitle: '' }],
	});
	fireEvent.click(
		screen.getByRole('button', { name: 'Выбрать профиль: Специальность ещё не выбрана' }),
	);
	await waitFor(() => expect(push).toHaveBeenCalledWith('/profile/edit'));
	expect(actions.create).not.toHaveBeenCalled();
});
test('creates without client arguments and follows the edit target', async () => {
	const { actions } = interactive();
	fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
	await waitFor(() => expect(push).toHaveBeenCalledWith('/profile/edit'));
	expect(actions.create).toHaveBeenCalledTimes(1);
	expect(actions.create).toHaveBeenCalledWith();
	expect(actions.select).not.toHaveBeenCalled();
});
test.each([
	[3, false],
	[4, false],
	[10, true],
	[11, true],
])('blocks creation at or above limit %s premium=%s', (count, premium) => {
	const actions = operations();
	interactive(actions, {
		hasPremiumAccess: premium,
		profiles: Array.from({ length: count }, (_, i) => ({
			...accountData.profiles[0],
			id: String(i),
		})),
	});
	expect(screen.getByRole('button', { name: 'Добавить' })).toBeDisabled();
	fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
	expect(actions.create).not.toHaveBeenCalled();
});
test('blocks creation for an unfinished profile', () => {
	const actions = operations();
	interactive(actions, {
		...accountData,
		profiles: [{ id: 'empty', specializationId: 0, isActive: false, specializationTitle: '' }],
	});
	expect(screen.getByRole('button', { name: 'Добавить' })).toBeDisabled();
	expect(actions.create).not.toHaveBeenCalled();
});
test('serializes double clicks and creation across hash unmounts', async () => {
	const actions = operations();
	const pending = deferred<{ status: string }>();
	actions.select.mockReturnValue(pending.promise);
	interactive(actions);
	const card = screen.getByRole('button', { name: 'Выбрать профиль: Backend' });
	fireEvent.click(card);
	fireEvent.click(card);
	fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
	fireEvent.click(screen.getByRole('tab', { name: 'Верификация' }));
	fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
	expect(screen.getByRole('button', { name: 'Добавить' })).toBeDisabled();
	expect(screen.getByRole('status')).toHaveTextContent('Обновляем профиль');
	expect(actions.select).toHaveBeenCalledTimes(1);
	expect(actions.create).not.toHaveBeenCalled();
	await act(async () => {
		pending.resolve({ status: 'error' });
		await pending.promise;
	});
	expect(screen.getByRole('button', { name: 'Добавить' })).not.toBeDisabled();
	expect(push).not.toHaveBeenCalled();
});
test.each([
	'limit-reached',
	'unfinished-profile-exists',
	'navigation-unavailable',
	'unauthenticated',
	'refresh-required',
	'forbidden',
	'not-found',
	'error',
])('keeps a safe visible error for %s without navigating', async (status) => {
	const actions = operations();
	actions.select.mockResolvedValue({ status });
	interactive(actions);
	fireEvent.click(screen.getByRole('button', { name: 'Выбрать профиль: Backend' }));
	await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
	expect(push).not.toHaveBeenCalled();
	expect(screen.getByRole('button', { name: 'Добавить' })).not.toBeDisabled();
	expect(screen.getByRole('alert').textContent).not.toMatch(/manage\.profiles\.feedback|undefined/);
});
test.each(['incomplete', 'outcome-unknown', 'throw'])(
	'blocks mutations across hash changes after %s',
	async (status) => {
		const actions = operations();
		if (status === 'throw') actions.create.mockRejectedValue(new Error('Private exception'));
		else actions.create.mockResolvedValue({ status });
		interactive(actions);
		fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Обновите страницу'));
		fireEvent.click(screen.getByRole('tab', { name: 'Верификация' }));
		fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
		fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
		fireEvent.click(screen.getByRole('button', { name: 'Выбрать профиль: Backend' }));
		expect(screen.getByRole('button', { name: 'Добавить' })).toBeDisabled();
		expect(actions.create).toHaveBeenCalledTimes(1);
		expect(actions.select).not.toHaveBeenCalled();
		expect(push).not.toHaveBeenCalled();
		expect(screen.getByRole('alert')).not.toHaveTextContent('Private exception');
	},
);
test('ignores a late successful action after shell unmount', async () => {
	const actions = operations();
	const pending = deferred<{ status: string; href: string }>();
	actions.select.mockReturnValue(pending.promise);
	const view = interactive(actions);
	fireEvent.click(screen.getByRole('button', { name: 'Выбрать профиль: Backend' }));
	view.unmount();
	await act(async () => {
		pending.resolve({ status: 'success', href: '/profile/edit' });
		await pending.promise;
	});
	expect(push).not.toHaveBeenCalled();
});
test('uses sibling native buttons without nested interactive elements', () => {
	interactive();
	const card = screen.getByRole('button', { name: 'Выбрать профиль: Frontend' });
	const open = screen.getByRole('button', { name: 'Перейти' });
	card.focus();
	expect(card).toHaveFocus();
	expect(card.tagName).toBe('BUTTON');
	expect(card).toHaveAttribute('type', 'button');
	expect(card.contains(open)).toBe(false);
	expect(open.contains(card)).toBe(false);
});

test('resolves the confirmed action href with the current locale through the existing navigation API', async () => {
	interactive();
	fireEvent.click(screen.getByRole('button', { name: 'Выбрать профиль: Backend' }));
	await waitFor(() => expect(localizedPush).toHaveBeenCalledWith('/ru/questions/backend'));
});
test('blocks simultaneous selection while creation is pending', async () => {
	const actions = operations();
	const pending = deferred<{ status: string }>();
	actions.create.mockReturnValue(pending.promise);
	interactive(actions);
	fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
	fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
	fireEvent.click(screen.getByRole('button', { name: 'Выбрать профиль: Backend' }));
	expect(actions.create).toHaveBeenCalledTimes(1);
	expect(actions.select).not.toHaveBeenCalled();
	await act(async () => {
		pending.resolve({ status: 'error' });
		await pending.promise;
	});
	expect(screen.getByRole('alert')).toBeInTheDocument();
});

test.each([
	[2, false],
	[9, true],
])('allows creation below the %s profile boundary premium=%s', async (count, premium) => {
	const actions = operations();
	interactive(actions, {
		hasPremiumAccess: premium,
		profiles: Array.from({ length: count }, (_, i) => ({
			...accountData.profiles[0],
			id: String(i),
		})),
	});
	expect(screen.getByRole('button', { name: 'Добавить' })).not.toBeDisabled();
	fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
	await waitFor(() => expect(actions.create).toHaveBeenCalledTimes(1));
});

test('opens and closes profile help without selecting, creating, or navigating', () => {
	const { actions } = interactive();
	fireEvent.click(screen.getByRole('button', { name: 'Как сменить специализацию' }));
	expect(
		screen.getByRole('dialog', { name: 'Как выбрать новую специальность' }),
	).toBeInTheDocument();
	fireEvent.click(screen.getByRole('button', { name: 'Закрыть модальное окно' }));
	expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	expect(actions.select).not.toHaveBeenCalled();
	expect(actions.create).not.toHaveBeenCalled();
	expect(push).not.toHaveBeenCalled();
});

const deletionData = { ...accountData, username: ' Name ' };
const deletionActions = () => ({
	...operations(),
	delete: jest.fn().mockResolvedValue({ status: 'success' }),
});
const renderDeletion = (actions = deletionActions(), data = deletionData) => {
	window.history.replaceState(null, '', '/ru/settings#account');
	const tree = (value: typeof deletionData) => (
		<NextIntlClientProvider locale="ru" messages={{ profile, header, translation }}>
			<SettingsShell account={value} profileActions={actions} />
		</NextIntlClientProvider>
	);
	const view = render(tree(data));
	return { ...view, actions, update: (value: typeof deletionData) => view.rerender(tree(value)) };
};
const openDeletion = () =>
	fireEvent.click(screen.getByRole('button', { name: 'Удалить профиль: Backend' }));
const confirmation = (value = ' Name ') =>
	fireEvent.change(screen.getByLabelText('Введите ваш никнейм для подтверждения'), {
		target: { value },
	});
const confirmDeletion = () =>
	fireEvent.click(screen.getByRole('button', { name: 'Удалить профиль' }));
test('offers deletion only for inactive profiles, opens without mutation, and cancels safely', () => {
	const view = renderDeletion();
	expect(
		screen.queryByRole('button', { name: 'Удалить профиль: Frontend' }),
	).not.toBeInTheDocument();
	openDeletion();
	expect(screen.getByRole('dialog', { name: 'Удаление профиля' })).toBeInTheDocument();
	expect(screen.getByText(/Все ваши данные, прогресс и активность будут/)).toBeInTheDocument();
	expect(view.actions.delete).not.toHaveBeenCalled();
	expect(view.actions.select).not.toHaveBeenCalled();
	fireEvent.click(screen.getByRole('button', { name: 'Отменить' }));
	expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
test('does not offer deletion for the last profile', () => {
	renderDeletion(deletionActions(), { ...deletionData, profiles: [deletionData.profiles[0]] });
	expect(
		screen.queryByRole('button', { name: 'Удалить профиль: Backend' }),
	).not.toBeInTheDocument();
});
test.each(['', 'Name', ' name ', ' Name', 'Name ', '  Name  '])(
	'requires exact confirmation %j',
	(value) => {
		const view = renderDeletion();
		openDeletion();
		confirmation(value);
		expect(screen.getByRole('button', { name: 'Удалить профиль' })).toBeDisabled();
		confirmDeletion();
		expect(view.actions.delete).not.toHaveBeenCalled();
	},
);
test('does not delete with an unavailable username', () => {
	const view = renderDeletion(deletionActions(), { ...deletionData, username: '' });
	openDeletion();
	confirmation('Name');
	confirmDeletion();
	expect(view.actions.delete).not.toHaveBeenCalled();
	expect(screen.getByRole('button', { name: 'Удалить профиль' })).toBeDisabled();
});
test('waits for confirmed deletion and fresh server props without optimistic removal or navigation', async () => {
	const actions = deletionActions();
	const pending = deferred<{ status: string }>();
	actions.delete.mockReturnValue(pending.promise);
	const view = renderDeletion(actions);
	openDeletion();
	confirmation();
	confirmDeletion();
	confirmDeletion();
	expect(actions.delete).toHaveBeenCalledTimes(1);
	expect(actions.delete).toHaveBeenCalledWith('other', ' Name ');
	expect(screen.getByRole('dialog')).toBeInTheDocument();
	expect(screen.getByText('Backend')).toBeInTheDocument();
	expect(refresh).not.toHaveBeenCalled();
	fireEvent.click(screen.getByRole('button', { name: 'Отменить' }));
	fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
	expect(screen.getByRole('dialog')).toBeInTheDocument();
	await act(async () => {
		pending.resolve({ status: 'success' });
		await pending.promise;
	});
	expect(refresh).toHaveBeenCalledTimes(1);
	expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	expect(screen.getByText('Backend')).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Добавить' })).toBeDisabled();
	view.update({ ...deletionData, profiles: [deletionData.profiles[1]] });
	await waitFor(() => expect(screen.getByRole('button', { name: 'Добавить' })).not.toBeDisabled());
	expect(screen.queryByText('Backend')).not.toBeInTheDocument();
	expect(screen.getByText('Frontend')).toBeInTheDocument();
	expect(window.location.hash).toBe('#account');
	expect(push).not.toHaveBeenCalled();
});
test('rejects a stale refresh without assuming the deleted card disappeared', async () => {
	const view = renderDeletion();
	openDeletion();
	confirmation();
	confirmDeletion();
	await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
	view.update({ ...deletionData, profiles: [...deletionData.profiles] });
	await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('не подтверждён'));
	expect(screen.getByText('Backend')).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Добавить' })).toBeDisabled();
});
test.each([
	'invalid-input',
	'confirmation-mismatch',
	'forbidden',
	'last-profile',
	'active-profile',
	'error',
	'unauthenticated',
	'refresh-required',
])('keeps confirmation open with a safe %s error', async (status) => {
	const actions = deletionActions();
	actions.delete.mockResolvedValue({ status });
	renderDeletion(actions);
	openDeletion();
	confirmation();
	confirmDeletion();
	await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
	expect(screen.getByRole('dialog')).toBeInTheDocument();
	expect(screen.getByLabelText('Введите ваш никнейм для подтверждения')).toHaveValue(' Name ');
	expect(screen.getByRole('button', { name: 'Отменить' })).toBeEnabled();
	expect(refresh).not.toHaveBeenCalled();
	expect(push).not.toHaveBeenCalled();
});
test.each(['incomplete', 'outcome-unknown', 'throw'])(
	'preserves confirmation and the global lock across tabs after %s',
	async (status) => {
		const actions = deletionActions();
		if (status === 'throw') actions.delete.mockRejectedValue(new Error('Private details'));
		else actions.delete.mockResolvedValue({ status });
		renderDeletion(actions);
		openDeletion();
		confirmation();
		confirmDeletion();
		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Обновите страницу'));
		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Удалить профиль' })).toBeDisabled();
		fireEvent.click(screen.getByRole('tab', { name: 'Верификация' }));
		fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
		expect(screen.getByLabelText('Введите ваш никнейм для подтверждения')).toHaveValue(' Name ');
		confirmDeletion();
		fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
		fireEvent.click(screen.getByRole('button', { name: 'Выбрать профиль: Frontend' }));
		expect(actions.delete).toHaveBeenCalledTimes(1);
		expect(actions.create).not.toHaveBeenCalled();
		expect(actions.select).not.toHaveBeenCalled();
		expect(refresh).not.toHaveBeenCalled();
		expect(push).not.toHaveBeenCalled();
	},
);
test.each(['create', 'select'])('cannot open deletion during %s', async (kind) => {
	const actions = deletionActions();
	const pending = deferred<{ status: string }>();
	actions[kind].mockReturnValue(pending.promise);
	renderDeletion(actions);
	fireEvent.click(
		screen.getByRole('button', {
			name: kind === 'create' ? 'Добавить' : 'Выбрать профиль: Frontend',
		}),
	);
	fireEvent.click(screen.getByRole('button', { name: 'Удалить профиль: Backend' }));
	expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	expect(actions.delete).not.toHaveBeenCalled();
	await act(async () => {
		pending.resolve({ status: 'error' });
		await pending.promise;
	});
});
test('shares the lock with creation and selection during deletion', async () => {
	const actions = deletionActions();
	const pending = deferred<{ status: string }>();
	actions.delete.mockReturnValue(pending.promise);
	renderDeletion(actions);
	openDeletion();
	confirmation();
	confirmDeletion();
	fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
	fireEvent.click(screen.getByRole('button', { name: 'Выбрать профиль: Frontend' }));
	expect(actions.create).not.toHaveBeenCalled();
	expect(actions.select).not.toHaveBeenCalled();
	await act(async () => {
		pending.resolve({ status: 'error' });
		await pending.promise;
	});
});

const accountUUID = '11111111-1111-4111-8111-111111111111';
const setupAccount = (
	deleteAccountAction = jest.fn().mockResolvedValue({ status: 'success' }),
	actions = deletionActions(),
) => {
	window.history.replaceState(null, '', '/ru/settings#account');
	const data = {
		...deletionData,
		profiles: deletionData.profiles.map((item, index) => ({
			...item,
			id: index === 0 ? accountUUID : '22222222-2222-4222-8222-222222222222',
		})),
	};
	const tree = (value = data) => (
		<NextIntlClientProvider locale="ru" messages={{ profile, header, translation, user }}>
			<SettingsShell
				account={value}
				profileActions={actions}
				deleteAccountAction={deleteAccountAction}
			/>
		</NextIntlClientProvider>
	);
	const view = render(tree());
	return {
		...view,
		actions,
		deleteAccountAction,
		update: () => view.rerender(tree({ ...data, profiles: [...data.profiles] })),
	};
};
const openAccount = () => fireEvent.click(screen.getByRole('button', { name: 'Удалить аккаунт' }));
const accountConfirm = (value = ' Name ') =>
	fireEvent.change(screen.getByLabelText('Введите ваш никнейм для подтверждения'), {
		target: { value },
	});
const submitAccount = () =>
	fireEvent.click(
		within(screen.getByRole('dialog', { name: 'Удаление аккаунта' })).getByRole('button', {
			name: 'Удалить аккаунт',
		}),
	);
test('unlocks all four mutations only after confirmed profile deletion refresh', async () => {
	window.history.replaceState(null, '', '/ru/settings#account');
	const actions = deletionActions();
	const pending = deferred<{ status: string }>();
	actions.delete.mockReturnValue(pending.promise);
	const deleteAccountAction = jest.fn();
	const data = {
		...deletionData,
		profiles: [
			...deletionData.profiles,
			{ ...deletionData.profiles[0], id: accountUUID, specializationTitle: 'Mobile' },
		],
	};
	const tree = (account = data) => (
		<NextIntlClientProvider locale="ru" messages={{ profile, header, translation, user }}>
			<SettingsShell
				account={account}
				profileActions={actions}
				deleteAccountAction={deleteAccountAction}
			/>
		</NextIntlClientProvider>
	);
	const view = render(tree());
	openDeletion();
	confirmation();
	confirmDeletion();
	const buttons = () => [
		screen.getByRole('button', { name: 'Добавить' }),
		screen.getByRole('button', { name: 'Выбрать профиль: Mobile' }),
		screen.getByRole('button', { name: 'Удалить профиль: Mobile' }),
		screen.getByRole('button', { name: 'Удалить аккаунт' }),
	];
	buttons().forEach((button) => expect(button).toBeDisabled());
	await act(async () => {
		pending.resolve({ status: 'success' });
		await pending.promise;
	});
	expect(refresh).toHaveBeenCalledTimes(1);
	buttons().forEach((button) => expect(button).toBeDisabled());
	expect(screen.getByText('Backend')).toBeInTheDocument();
	view.rerender(tree({ ...data, profiles: data.profiles.filter((item) => item.id !== 'other') }));
	await waitFor(() => buttons().forEach((button) => expect(button).not.toBeDisabled()));
	expect(screen.queryByText('Backend')).not.toBeInTheDocument();
	openAccount();
	expect(screen.getByRole('dialog', { name: 'Удаление аккаунта' })).toBeInTheDocument();
	expect(deleteAccountAction).not.toHaveBeenCalled();
	expect(actions.delete).toHaveBeenCalledTimes(1);
	expect(actions.create).not.toHaveBeenCalled();
	expect(actions.select).not.toHaveBeenCalled();
	expect(signOut).not.toHaveBeenCalled();
	expect(window.location.hash).toBe('#account');
});
test('shows account deletion after profiles, opens without sending, and clears cancellation input', () => {
	const view = setupAccount();
	const heading = screen.getByRole('heading', { name: 'Удаление аккаунта' });
	expect(
		screen.getByRole('heading', { name: 'Ваши профили' }).compareDocumentPosition(heading) &
			Node.DOCUMENT_POSITION_FOLLOWING,
	).toBeTruthy();
	openAccount();
	expect(view.deleteAccountAction).not.toHaveBeenCalled();
	accountConfirm();
	fireEvent.click(screen.getByRole('button', { name: 'Отменить' }));
	openAccount();
	expect(screen.getByLabelText('Введите ваш никнейм для подтверждения')).toHaveValue('');
	expect(view.deleteAccountAction).not.toHaveBeenCalled();
});
test.each(['', 'Name', ' name ', ' Name', 'Name '])(
	'does not send a mismatched account confirmation %j',
	(value) => {
		const view = setupAccount();
		openAccount();
		accountConfirm(value);
		submitAccount();
		expect(view.deleteAccountAction).not.toHaveBeenCalled();
		expect(signOut).not.toHaveBeenCalled();
	},
);
test('serializes account deletion and signs out once before navigating to registration', async () => {
	const pending = deferred<{ status: string }>();
	const deleteAction = jest.fn().mockReturnValue(pending.promise);
	const logout = deferred<{ url: string }>();
	signOut.mockReturnValueOnce(logout.promise);
	const view = setupAccount(deleteAction);
	openAccount();
	accountConfirm();
	submitAccount();
	submitAccount();
	expect(deleteAction).toHaveBeenCalledTimes(1);
	expect(deleteAction).toHaveBeenCalledWith(' Name ');
	fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
	fireEvent.click(screen.getByRole('button', { name: 'Выбрать профиль: Frontend' }));
	fireEvent.click(screen.getByRole('button', { name: 'Удалить профиль: Backend' }));
	expect(view.actions.create).not.toHaveBeenCalled();
	expect(view.actions.select).not.toHaveBeenCalled();
	expect(view.actions.delete).not.toHaveBeenCalled();
	expect(signOut).not.toHaveBeenCalled();
	fireEvent.click(screen.getByRole('button', { name: 'Отменить' }));
	expect(screen.getByRole('dialog', { name: 'Удаление аккаунта' })).toBeInTheDocument();
	await act(async () => {
		pending.resolve({ status: 'success' });
		await pending.promise;
	});
	expect(signOut).toHaveBeenCalledTimes(1);
	expect(signOut).toHaveBeenCalledWith({ redirect: false });
	expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Удалить аккаунт' })).not.toBeInTheDocument();
	expect(replace).not.toHaveBeenCalled();
	view.update();
	for (const name of ['Добавить', 'Выбрать профиль: Frontend', 'Удалить профиль: Backend']) {
		expect(screen.getByRole('button', { name })).toBeDisabled();
	}
	fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
	expect(view.actions.create).not.toHaveBeenCalled();
	await act(async () => {
		logout.resolve({ url: '/settings' });
		await logout.promise;
	});
	expect(replace).toHaveBeenCalledWith('/auth/register');
	expect(
		jest
			.requireActual('@/shared/config/navigation')
			.getPathname({ locale: 'ru', href: replace.mock.calls[0][0] }),
	).toBe('/ru/auth/register');
	expect(deleteAction).toHaveBeenCalledTimes(1);
	expect(refresh).not.toHaveBeenCalled();
});
test('retries only sign-out after a confirmed deletion and sign-out failure', async () => {
	signOut
		.mockRejectedValueOnce(new Error('Private signout'))
		.mockResolvedValueOnce({ url: '/settings' });
	const view = setupAccount();
	openAccount();
	accountConfirm();
	submitAccount();
	await waitFor(() =>
		expect(screen.getByRole('button', { name: 'Повторить выход' })).toBeInTheDocument(),
	);
	expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	expect(screen.queryByLabelText('Введите ваш никнейм для подтверждения')).not.toBeInTheDocument();
	expect(replace).not.toHaveBeenCalled();
	fireEvent.click(screen.getByRole('tab', { name: 'Верификация' }));
	fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
	view.update();
	for (const name of ['Добавить', 'Выбрать профиль: Frontend', 'Удалить профиль: Backend']) {
		expect(screen.getByRole('button', { name })).toBeDisabled();
	}
	fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));
	expect(view.actions.create).not.toHaveBeenCalled();
	fireEvent.click(screen.getByRole('button', { name: 'Повторить выход' }));
	await waitFor(() => expect(replace).toHaveBeenCalledWith('/auth/register'));
	expect(signOut).toHaveBeenCalledTimes(2);
	expect(view.deleteAccountAction).toHaveBeenCalledTimes(1);
});
test.each(['outcome-unknown', 'throw'])(
	'locks every mutation and preserves input on account outcome %s',
	async (status) => {
		const action = jest.fn();
		if (status === 'throw') action.mockRejectedValue(new Error('Private'));
		else action.mockResolvedValue({ status });
		const view = setupAccount(action);
		openAccount();
		accountConfirm();
		submitAccount();
		await waitFor(() =>
			expect(screen.getByRole('alert')).toHaveTextContent('Результат удаления неизвестен'),
		);
		expect(screen.getByLabelText('Введите ваш никнейм для подтверждения')).toHaveValue(' Name ');
		expect(screen.getByRole('dialog')).toBeInTheDocument();
		view.update();
		for (const name of ['Добавить', 'Выбрать профиль: Frontend', 'Удалить профиль: Backend']) {
			expect(screen.getByRole('button', { name })).toBeDisabled();
		}
		fireEvent.click(screen.getByRole('tab', { name: 'Верификация' }));
		fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
		submitAccount();
		expect(action).toHaveBeenCalledTimes(1);
		expect(signOut).not.toHaveBeenCalled();
		expect(replace).not.toHaveBeenCalled();
		expect(window.location.hash).toBe('#account');
		expect(screen.getByRole('button', { name: 'Добавить' })).toBeDisabled();
		expect(view.actions.create).not.toHaveBeenCalled();
	},
);
test.each([
	'confirmation-mismatch',
	'invalid-input',
	'unauthenticated',
	'refresh-required',
	'forbidden',
	'error',
])('keeps account input and stays on the tab after %s', async (status) => {
	const action = jest.fn().mockResolvedValue({ status });
	setupAccount(action);
	openAccount();
	accountConfirm();
	submitAccount();
	await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
	expect(screen.getByLabelText('Введите ваш никнейм для подтверждения')).toHaveValue(' Name ');
	expect(signOut).not.toHaveBeenCalled();
	expect(replace).not.toHaveBeenCalled();
	expect(window.location.hash).toBe('#account');
});
test.each(['create', 'select', 'delete'])(
	'prevents account deletion while profile %s is pending',
	async (kind) => {
		const actions = deletionActions();
		const pending = deferred<{ status: string }>();
		actions[kind].mockReturnValue(pending.promise);
		const view = setupAccount(jest.fn(), actions);
		if (kind === 'delete') {
			openDeletion();
			confirmation();
			confirmDeletion();
		} else
			fireEvent.click(
				screen.getByRole('button', {
					name: kind === 'create' ? 'Добавить' : 'Выбрать профиль: Backend',
				}),
			);
		const trigger = screen.getAllByRole('button', { name: 'Удалить аккаунт' })[0];
		expect(trigger).toBeDisabled();
		fireEvent.click(trigger);
		expect(view.deleteAccountAction).not.toHaveBeenCalled();
		await act(async () => {
			pending.resolve({ status: 'error' });
			await pending.promise;
		});
	},
);

test.each([undefined, {}, { url: '' }, { url: '/settings', error: 'failed' }])(
	'does not accept an unconfirmed sign-out response %#',
	async (response) => {
		signOut.mockResolvedValueOnce(response);
		const view = setupAccount();
		openAccount();
		accountConfirm();
		submitAccount();
		await waitFor(() =>
			expect(screen.getByRole('button', { name: 'Повторить выход' })).toBeInTheDocument(),
		);
		expect(replace).not.toHaveBeenCalled();
		expect(view.deleteAccountAction).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	},
);
test('does not trigger sign-out or navigation from a late deletion response after shell unmount', async () => {
	const pending = deferred<{ status: string }>();
	const action = jest.fn().mockReturnValue(pending.promise);
	const view = setupAccount(action);
	openAccount();
	accountConfirm();
	submitAccount();
	view.unmount();
	await act(async () => {
		pending.resolve({ status: 'success' });
		await pending.promise;
	});
	expect(signOut).not.toHaveBeenCalled();
	expect(replace).not.toHaveBeenCalled();
});

test('keeps tariff data across hash navigation without loading or mutating backend state', () => {
	const originalFetch = globalThis.fetch;
	const fetchSpy = jest.fn().mockRejectedValue(new Error('No requests allowed'));
	globalThis.fetch = fetchSpy;
	try {
		render(
			<NextIntlClientProvider locale="ru" messages={{ profile, header, subscription }}>
				<SettingsShell
					tariffData={{
						catalog: {
							status: 'success',
							gate: { status: 'allowed', showTariffs: true },
							tariffs: [
								{
									id: 1,
									code: 'month',
									finalPrice: 900,
									pricePerMonth: 900,
									discount: 0,
									monthPeriod: 1,
								},
							],
						},
						canStartTrial: false,
						currentSubscription: null,
					}}
				/>
			</NextIntlClientProvider>,
		);
		expect(screen.getByRole('article', { name: '1 месяц' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Подписаться' })).toBeDisabled();
		fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
		expect(screen.queryByRole('article')).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole('tab', { name: 'Выбрать тариф' }));
		expect(screen.getByRole('article', { name: '1 месяц' })).toBeInTheDocument();
		expect(window.location.hash).toBe('#select-tariff');
		expect(fetchSpy).not.toHaveBeenCalled();
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test('keeps payment pagination above hash panels, after the subscription, without repeating reads', async () => {
	historyIdentity = 'history-owner';
	const read = jest.fn().mockResolvedValue({
		status: 'success',
		page: 2,
		limit: 5,
		total: 6,
		items: [{ dateLabel: 'Вторая страница', isConfirmed: false }],
	});
	const options = {
		ownerId: 'history-owner',
		initial: {
			status: 'success' as const,
			page: 1,
			limit: 5 as const,
			total: 6,
			items: [{ dateLabel: 'Первая страница', isConfirmed: true }],
		},
		read,
	};
	render(
		<NextIntlClientProvider locale="ru" messages={{ profile, header, subscription }}>
			<SettingsShell
				paymentHistory={options}
				tariffData={{
					catalog: { status: 'hidden', gate: { status: 'missing', showTariffs: false } },
					canStartTrial: false,
					currentSubscription: {
						state: 'canceled',
						daysLeft: 1,
						daysInCreationMonth: 31,
						endDateLabel: '1 февраля 2026',
					},
				}}
			/>
		</NextIntlClientProvider>,
	);
	expect(
		screen
			.getByText('Участник сообщества')
			.compareDocumentPosition(screen.getByText('Ваши предыдущие платежи')) &
			Node.DOCUMENT_POSITION_FOLLOWING,
	).toBeTruthy();
	fireEvent.click(screen.getByRole('button', { name: '2' }));
	await waitFor(() => expect(screen.getByText('Вторая страница')).toBeInTheDocument());
	fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
	expect(screen.queryByText('Вторая страница')).not.toBeInTheDocument();
	fireEvent.click(screen.getByRole('tab', { name: 'Выбрать тариф' }));
	expect(screen.getByText('Вторая страница')).toBeInTheDocument();
	expect(read).toHaveBeenCalledTimes(1);
	expect(read).toHaveBeenCalledWith(2);
});

const trialCatalog = {
	status: 'success' as const,
	gate: { status: 'allowed' as const, showTariffs: true as const },
	tariffs: [
		{ id: 1, code: 'free' as const, finalPrice: 0, pricePerMonth: 0, discount: 0, monthPeriod: 1 },
	],
};
const trialShell = (
	action: () => Promise<{ status: 'success' | 'outcome-unknown' }>,
	emailActions = {
		send: jest.fn().mockResolvedValue({ status: 'success' }),
		read: jest.fn().mockResolvedValue({ status: 'success', isVerified: true }),
	},
	verified = true,
	premium = false,
) => (
	<NextIntlClientProvider locale="ru" messages={{ profile, header, translation, subscription }}>
		<SettingsShell
			trialAction={action}
			tariffData={{
				catalog: trialCatalog,
				canStartTrial: true,
				currentSubscription: premium
					? {
							state: 'active',
							daysLeft: 7,
							daysInCreationMonth: 31,
							endDateLabel: '1 февраля 2026',
						}
					: null,
			}}
			emailVerification={{
				email: 'synthetic@example.invalid',
				isVerified: verified,
				actions: emailActions,
			}}
		/>
	</NextIntlClientProvider>
);
test('preserves an unknown trial lock across hash panels and fresh same-identity props', async () => {
	const action = jest.fn().mockResolvedValue({ status: 'outcome-unknown' });
	const view = render(trialShell(action));
	await act(async () => {
		fireEvent.click(screen.getByRole('button', { name: 'Тест драйв 7 дней' }));
		await Promise.resolve();
	});
	expect(screen.getByRole('alert')).toHaveTextContent('Failed to connect trial subscription');
	fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
	fireEvent.click(screen.getByRole('tab', { name: 'Выбрать тариф' }));
	view.rerender(trialShell(action));
	const button = screen.getByRole('button', { name: 'Тест драйв 7 дней' });
	expect(button).toBeDisabled();
	fireEvent.click(button);
	expect(action).toHaveBeenCalledTimes(1);
});
test('refreshes once after trial success and switches to premium when the refreshed props arrive', async () => {
	window.history.replaceState({}, '', '/ru/settings#select-tariff');
	const action = jest.fn().mockResolvedValue({ status: 'success' });
	const oldCount = refresh.mock.calls.length;
	const view = render(trialShell(action));
	await act(async () => {
		fireEvent.click(screen.getByRole('button', { name: 'Тест драйв 7 дней' }));
		await Promise.resolve();
	});
	expect(screen.getByRole('status')).toHaveTextContent(
		'You have successfully connected a trial subscription',
	);
	expect(refresh.mock.calls.length).toBe(oldCount + 1);
	expect(window.location.hash).toBe('#select-tariff');
	view.rerender(trialShell(action, undefined, true, true));
	expect(screen.getByText('Участник сообщества')).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Тест драйв 7 дней' })).not.toBeInTheDocument();
	expect(action).toHaveBeenCalledTimes(1);
	expect(refresh.mock.calls.length).toBe(oldCount + 1);
});
test('uses verified email from existing polling before allowing a trial mutation', async () => {
	jest.useFakeTimers();
	try {
		const action = jest.fn().mockResolvedValue({ status: 'success' });
		const email = {
			send: jest.fn().mockResolvedValue({ status: 'success' }),
			read: jest.fn().mockResolvedValue({ status: 'success', isVerified: true }),
		};
		render(trialShell(action, email, false));
		fireEvent.click(screen.getByRole('button', { name: 'Тест драйв 7 дней' }));
		expect(action).not.toHaveBeenCalled();
		expect(localizedPush).toHaveBeenCalledWith('/ru/settings#email-verify');
		fireEvent.click(screen.getByRole('tab', { name: 'Верификация' }));
		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: profile.email.verification.submit }));
			await Promise.resolve();
		});
		await act(async () => {
			await jest.advanceTimersByTimeAsync(5000);
		});
		expect(email.read).toHaveBeenCalledTimes(1);
		fireEvent.click(screen.getByRole('tab', { name: 'Выбрать тариф' }));
		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: 'Тест драйв 7 дней' }));
			await Promise.resolve();
		});
		expect(action).toHaveBeenCalledTimes(1);
	} finally {
		jest.useRealTimers();
	}
});

jest.mock('next/navigation', () => ({
	...jest.requireActual('next/navigation'),
	usePathname: () => '/ru/settings',
	useRouter: () => settingsRouter,
}));

const checkoutShell = (
	paymentAction: NonNullable<Parameters<typeof SettingsShell>[0]['paymentAction']>,
	trialAction = jest.fn(),
	verified = true,
	overrides: Partial<ComponentProps<typeof SettingsShell>> = {},
) => (
	<NextIntlClientProvider locale="ru" messages={{ profile, header, translation, subscription }}>
		<SettingsShell
			paymentAction={paymentAction}
			trialAction={trialAction}
			tariffData={{
				catalog: {
					...trialCatalog,
					tariffs: [
						...trialCatalog.tariffs,
						{
							id: 2,
							code: 'month',
							finalPrice: 800,
							pricePerMonth: 800,
							discount: 0,
							monthPeriod: 1,
						},
					],
				},
				canStartTrial: true,
				currentSubscription: null,
			}}
			emailVerification={{
				email: 'synthetic@example.invalid',
				isVerified: verified,
				actions: {
					send: jest.fn().mockResolvedValue({ status: 'success' }),
					read: jest.fn().mockResolvedValue({ status: 'success', isVerified: true }),
				},
			}}
			{...overrides}
		/>
	</NextIntlClientProvider>
);
test('keeps the checkout draft and terminal gate above hash panels and refreshed props', async () => {
	const action = jest.fn().mockResolvedValue({ status: 'conflict' });
	const trial = jest.fn();
	const view = render(checkoutShell(action, trial));
	fireEvent.click(screen.getByRole('button', { name: 'Подписаться' }));
	expect(action).not.toHaveBeenCalled();
	screen.getAllByRole('checkbox').forEach((checkbox) => fireEvent.click(checkbox));
	fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Подписаться' }));
	expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось подключить подписку');
	fireEvent.click(screen.getByRole('button', { name: 'Закрыть модальное окно' }));
	fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
	fireEvent.click(screen.getByRole('tab', { name: 'Выбрать тариф' }));
	view.rerender(checkoutShell(action, trial));
	expect(screen.getByRole('button', { name: 'Тест драйв 7 дней' })).toBeDisabled();
	expect(screen.getByRole('button', { name: 'Подписаться' })).toBeDisabled();
	expect(action).toHaveBeenCalledTimes(1);
	expect(trial).not.toHaveBeenCalled();
	expect(window.location.hash).toBe('#select-tariff');
});
test('uses verification confirmed by the existing polling before checkout', async () => {
	jest.useFakeTimers();
	try {
		const action = jest.fn().mockResolvedValue({ status: 'forbidden' });
		render(checkoutShell(action, jest.fn(), false));
		fireEvent.click(screen.getByRole('tab', { name: 'Верификация' }));
		fireEvent.click(screen.getByRole('button', { name: profile.email.verification.submit }));
		await act(async () => {
			await Promise.resolve();
		});
		await act(async () => {
			await jest.advanceTimersByTimeAsync(5000);
		});
		fireEvent.click(screen.getByRole('tab', { name: 'Выбрать тариф' }));
		fireEvent.click(screen.getByRole('button', { name: 'Подписаться' }));
		screen.getAllByRole('checkbox').forEach((checkbox) => fireEvent.click(checkbox));
		await act(async () => {
			fireEvent.click(
				within(screen.getByRole('dialog')).getByRole('button', { name: 'Подписаться' }),
			);
			await Promise.resolve();
		});
		expect(action).toHaveBeenCalledTimes(1);
	} finally {
		jest.useRealTimers();
	}
});

const cancellationId = '22222222-2222-4222-8222-222222222222';
const cancellationView = {
	state: 'active' as const,
	daysLeft: 7,
	daysInCreationMonth: 31,
	endDateLabel: '1 февраля 2030',
};
const cancellationSuccess = {
	status: 'success' as const,
	subscription: { ...cancellationView, state: 'canceled' as const },
};
const cancellationShell = (
	action: NonNullable<Parameters<typeof SettingsShell>[0]['cancelAction']>,
	options: NonNullable<Parameters<typeof SettingsShell>[0]['paymentHistory']>,
	state: 'active' | 'canceled' = 'active',
) => (
	<NextIntlClientProvider locale="ru" messages={{ profile, header, subscription, translation }}>
		<SettingsShell
			cancelAction={action}
			cancelSubscriptionId={cancellationId}
			paymentHistory={options}
			tariffData={{
				catalog: { status: 'hidden', gate: { status: 'missing', showTariffs: false } },
				canStartTrial: false,
				currentSubscription: { ...cancellationView, state },
			}}
		/>
	</NextIntlClientProvider>
);
const cancellationHistory = () => {
	const read = jest.fn().mockResolvedValue({
		status: 'success',
		items: [{ dateLabel: 'Вторая страница отмены', isConfirmed: true }],
		page: 2,
		limit: 5,
		total: 6,
	});
	return {
		ownerId: 'history-owner',
		initial: {
			status: 'success' as const,
			items: [{ dateLabel: 'Первая страница отмены', isConfirmed: false }],
			page: 1,
			limit: 5 as const,
			total: 6,
		},
		read,
	};
};
test('preserves payment page through cancellation, automatic RSC props and hash navigation without refresh', async () => {
	historyIdentity = 'history-owner';
	let resolve!: (value: typeof cancellationSuccess) => void;
	const action = jest.fn().mockReturnValue(
		new Promise((done) => {
			resolve = done;
		}),
	);
	const options = cancellationHistory();
	const originalRefreshes = refresh.mock.calls.length;
	const view = render(cancellationShell(action, options));
	fireEvent.click(screen.getByRole('button', { name: '2' }));
	await screen.findByText('Вторая страница отмены');
	fireEvent.click(screen.getByRole('button', { name: 'Отменить подписку' }));
	expect(action).not.toHaveBeenCalled();
	fireEvent.click(screen.getByRole('button', { name: 'Да' }));
	expect(action).toHaveBeenCalledTimes(1);
	expect(action).toHaveBeenCalledWith(cancellationId);
	// The Action's revalidatePath can deliver new props before its Promise resolves.
	view.rerender(
		cancellationShell(action, { ...options, initial: { ...options.initial } }, 'canceled'),
	);
	expect(screen.getByText('Вторая страница отмены')).toBeInTheDocument();
	fireEvent.click(screen.getByRole('button', { name: 'Нет' }));
	fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
	fireEvent.click(screen.getByRole('tab', { name: 'Выбрать тариф' }));
	expect(screen.getByText('Вторая страница отмены')).toBeInTheDocument();
	await act(async () => {
		resolve(cancellationSuccess);
		await Promise.resolve();
	});
	expect(screen.getByRole('status')).toHaveTextContent('Подписка отключена');
	expect(
		screen.getByText('Вы отменили подписку. Полный доступ сохранится до 1 февраля 2030.'),
	).toBeInTheDocument();
	expect(screen.getByText('Осталось 7 дней')).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Отменить подписку' })).not.toBeInTheDocument();
	view.rerender(cancellationShell(action, { ...options, initial: { ...options.initial } }));
	expect(screen.getByText('Вторая страница отмены')).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Отменить подписку' })).not.toBeInTheDocument();
	expect(options.read).toHaveBeenCalledTimes(1);
	expect(refresh).toHaveBeenCalledTimes(originalRefreshes);
	expect(window.location.hash).toBe('#select-tariff');
});
test('keeps cancellation blocked through same-identity fresh props and hash panels after an unknown outcome', async () => {
	const action = jest.fn().mockResolvedValue({ status: 'outcome-unknown' });
	const options = cancellationHistory();
	const view = render(cancellationShell(action, options));
	fireEvent.click(screen.getByRole('button', { name: 'Отменить подписку' }));
	fireEvent.click(screen.getByRole('button', { name: 'Да' }));
	expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось отключить подписку');
	fireEvent.click(screen.getByRole('button', { name: 'Нет' }));
	fireEvent.click(screen.getByRole('tab', { name: 'Аккаунт' }));
	fireEvent.click(screen.getByRole('tab', { name: 'Выбрать тариф' }));
	view.rerender(cancellationShell(action, { ...options }));
	expect(screen.getByRole('button', { name: 'Отменить подписку' })).toBeDisabled();
	expect(action).toHaveBeenCalledTimes(1);
});
test.each([false, true])(
	'accepts fresh premium history after blocked checkout (existing history: %s)',
	async (hasHistory) => {
		historyIdentity = 'history-owner';
		const action = jest.fn().mockResolvedValue({ status: 'outcome-unknown' });
		const trial = jest.fn();
		const options = cancellationHistory();
		const premium = {
			catalog: {
				status: 'hidden' as const,
				gate: { status: 'missing' as const, showTariffs: false as const },
			},
			canStartTrial: false,
			currentSubscription: cancellationView,
		};
		const view = render(checkoutShell(action, trial));
		fireEvent.click(screen.getByRole('button', { name: 'Подписаться' }));
		if (hasHistory) {
			view.rerender(
				checkoutShell(action, trial, true, { tariffData: premium, paymentHistory: options }),
			);
			expect(screen.getByText('Первая страница отмены')).toBeInTheDocument();
		}
		screen.getAllByRole('checkbox').forEach((checkbox) => fireEvent.click(checkbox));
		fireEvent.click(
			within(screen.getByRole('dialog')).getByRole('button', { name: 'Подписаться' }),
		);
		expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось подключить подписку');
		fireEvent.click(screen.getByRole('button', { name: 'Закрыть модальное окно' }));
		const updated = {
			...options,
			initial: {
				...options.initial,
				items: [{ dateLabel: 'Новая серверная история', isConfirmed: true }],
			},
		};
		view.rerender(
			checkoutShell(action, trial, true, {
				tariffData: premium,
				paymentHistory: updated,
				cancelAction: jest.fn(),
				cancelSubscriptionId: cancellationId,
			}),
		);
		expect(screen.getByText('Новая серверная история')).toBeInTheDocument();
		expect(screen.queryByText('Первая страница отмены')).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Отменить подписку' })).toBeDisabled();
		expect(action).toHaveBeenCalledTimes(1);
		expect(trial).not.toHaveBeenCalled();
		expect(options.read).not.toHaveBeenCalled();
		historyIdentity = 'another-history-owner';
		view.rerender(
			checkoutShell(action, trial, true, {
				tariffData: premium,
				paymentHistory: updated,
				cancelAction: jest.fn(),
				cancelSubscriptionId: cancellationId,
			}),
		);
		expect(screen.queryByText('Новая серверная история')).not.toBeInTheDocument();
		historyIdentity = 'history-owner';
	},
);
test('keeps the existing history reset for ordinary RSC updates outside cancellation', async () => {
	const action = jest.fn();
	const options = cancellationHistory();
	const view = render(cancellationShell(action, options));
	fireEvent.click(screen.getByRole('button', { name: '2' }));
	await screen.findByText('Вторая страница отмены');
	view.rerender(cancellationShell(action, { ...options, initial: { ...options.initial } }));
	expect(screen.queryByText('Вторая страница отмены')).not.toBeInTheDocument();
	expect(screen.getByText('Первая страница отмены')).toBeInTheDocument();
	expect(action).not.toHaveBeenCalled();
});

test.each(['account', 'email-verify'])(
	'follows a native membership hash transition from #%s and browser Back/Forward',
	async (hash) => {
		window.history.replaceState(null, '', `/ru/settings#${hash}`);
		const originalFetch = globalThis.fetch;
		const backend = jest.fn();
		globalThis.fetch = backend;
		try {
			mount();
			selected(hash === 'account' ? 3 : 2);
			// Header's same-document membership navigation uses this native hash assignment.
			act(() => {
				window.location.hash = '#select-tariff';
			});
			await waitFor(() => selected(0));
			act(() => window.history.back());
			await waitFor(() => selected(hash === 'account' ? 3 : 2));
			act(() => window.history.forward());
			await waitFor(() => selected(0));
			expect(backend).not.toHaveBeenCalled();
		} finally {
			globalThis.fetch = originalFetch;
		}
	},
);
