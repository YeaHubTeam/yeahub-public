import type { ReactElement } from 'react';

import '@testing-library/jest-dom';
import { act, fireEvent, render as rtlRender, screen, waitFor } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { NextIntlClientProvider } from 'next-intl';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToString } from 'react-dom/server';

import { AvatarStateProvider } from '@/entities/profile';
import type { OwnProfile, ProfileEditResult } from '@/entities/profile';

import { EditProfileForm } from '../index';
import type { EditProfileFormProps } from '../index';
import { createEditDefaults, toEditPayload } from '../lib/editProfileMapper';
import type { SavedProfileSnapshot } from '../lib/editProfileMapper';

const render = (ui: ReactElement) =>
	rtlRender(ui, {
		wrapper: ({ children }) => (
			<NextIntlClientProvider locale="ru" messages={{}}>
				<AvatarStateProvider userId="user">{children}</AvatarStateProvider>
			</NextIntlClientProvider>
		),
	});
const replace = jest.fn();
const refresh = jest.fn();
const update = jest.fn();
jest.mock('@/shared/config', () => ({
	Link: jest.requireActual('@/shared/config').Link,
	i18Namespace: { profile: 'profile', translation: 'translation' },
	ROUTES: { profile: { page: '/profile' }, auth: { login: { page: '/auth/login' } } },
	useRouter: () => ({ replace, refresh }),
	routing: { locales: ['ru'] },
	redirect: jest.fn(() => {
		throw new Error('REDIRECT');
	}),
}));
jest.mock('next/navigation', () => ({
	usePathname: () => '/ru/profile/edit',
	useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
}));
jest.mock('next-auth/react', () => ({
	useSession: () => ({ update, status: 'authenticated', data: { user: { id: 'user' } } }),
}));
jest.mock('next-intl', () => {
	const actual = jest.requireActual('next-intl');
	return {
		...actual,
		useTranslations: (namespace: string) =>
			actual.createTranslator({
				locale: 'ru',
				messages: jest.requireActual(`public/locales/ru/${namespace}.json`),
			}),
	};
});
const profile: OwnProfile = {
	id: 'user',
	username: 'Name',
	email: 'test@example.invalid',
	city: 'City',
	avatarUrl: null,
	country: null,
	birthday: null,
	isVerified: true,
	userRoles: [],
	activeProfile: {
		id: 'active',
		specializationId: 1,
		description: '<p>Original</p>',
		socialNetwork: [
			{ code: 'github', title: 'GH' },
			{ code: 'legacy', title: 'Server only' },
		],
		profileSkills: [{ id: 999, title: 'Outside catalogue', imageSrc: null }],
	},
};
const props = (): EditProfileFormProps => ({
	profile,
	specialization: { id: 1, title: 'Frontend' },
	skills: [{ id: 1, title: 'React' }],
	avatarAction: jest.fn(),
	saveAction: jest.fn().mockResolvedValue({ status: 'success' }),
	readAction: jest.fn().mockResolvedValue({ status: 'success', profile: saved() }),
});
const saved = (username = 'Changed'): SavedProfileSnapshot => ({
	id: 'user',
	profileId: 'active',
	username,
	city: 'City',
	description: '<p>Original</p>',
	socialNetwork: [{ code: 'github', title: 'GH' }],
	profileSkills: [999],
});
const go = (name: string) => fireEvent.click(screen.getByRole('tab', { name }));
const change = (value = 'Changed') =>
	fireEvent.change(screen.getByLabelText('Никнейм'), { target: { value } });
const save = () => fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
const warning = () => {
	const event = new Event('beforeunload', { cancelable: true });
	window.dispatchEvent(event);
	return event.defaultPrevented;
};
const deferred = <T,>() => {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((r) => {
		resolve = r;
	});
	return { resolve, promise };
};
const editor = () => {
	const node = screen.getByRole('textbox', { name: 'О себе любимом(-ой)' });
	return (node as HTMLElement & { editor: Editor }).editor;
};
beforeEach(() => {
	window.history.replaceState(null, '', '/ru/profile/edit');
});

it('renders a single form, real personal fields, read-only specialization/email and profile-edit avatar', () => {
	const { container } = render(<EditProfileForm {...props()} />);
	expect(container.querySelectorAll('form')).toHaveLength(1);
	expect(screen.getByLabelText('Никнейм')).toHaveValue('Name');
	expect(screen.getByLabelText('Email для связи')).toBeDisabled();
	expect(screen.getByText('Frontend')).toBeInTheDocument();
	expect(screen.getByText(/или перетащи сюда/)).toBeInTheDocument();
	expect(screen.getByLabelText('GitHub')).toHaveValue('GH');
	expect(warning()).toBe(false);
});
it.each([
	['personal-information', 'Личная информация'],
	['about-me', 'Обо мне'],
	['skills', 'Навыки'],
	['unknown', 'Личная информация'],
])('honors the initial hash %s', (hash, label) => {
	window.history.replaceState(null, '', `/ru/profile/edit#${hash}`);
	render(<EditProfileForm {...props()} />);
	expect(screen.getByRole('tab', { name: label })).toHaveAttribute('aria-selected', 'true');
});
it('preserves drafts, replaces hash history and responds to external hash changes', () => {
	render(<EditProfileForm {...props()} />);
	change();
	const length = history.length;
	go('Навыки');
	expect(screen.getByText('Outside catalogue')).toBeInTheDocument();
	expect(history.length).toBe(length);
	expect(location.hash).toBe('#skills');
	expect(warning()).toBe(true);
	act(() => {
		history.replaceState(null, '', '#personal-information');
		window.dispatchEvent(new HashChangeEvent('hashchange'));
	});
	expect(screen.getByLabelText('Никнейм')).toHaveValue('Changed');
});
it('supports keyboard tab selection and focus', () => {
	render(<EditProfileForm {...props()} />);
	fireEvent.keyDown(screen.getByRole('tab', { name: 'Личная информация' }), { key: 'End' });
	expect(screen.getByRole('tab', { name: 'Навыки' })).toHaveFocus();
	expect(screen.getByRole('tab', { name: 'Навыки' })).toHaveAttribute('aria-selected', 'true');
});
it('submits all initialized fields without visiting tabs, confirms readback then navigates cleanly', async () => {
	const p = props();
	render(<EditProfileForm {...p} />);
	change();
	expect(warning()).toBe(true);
	save();
	await waitFor(() => expect(replace).toHaveBeenCalledWith('/profile'));
	expect(p.saveAction).toHaveBeenCalledWith({
		...toEditPayload(createEditDefaults(profile), profile.activeProfile.description),
		username: 'Changed',
	});
	expect(p.readAction).toHaveBeenCalledTimes(1);
	expect(screen.getByRole('status')).toHaveTextContent('Профиль успешно обновлён');
	expect(warning()).toBe(false);
});
it('keeps a pending submit snapshot immutable and prevents repeated Save during save and readback', async () => {
	const pending = deferred<ProfileEditResult>();
	const read = deferred<Awaited<ReturnType<EditProfileFormProps['readAction']>>>();
	const p = props();
	p.saveAction = jest.fn(() => pending.promise);
	p.readAction = jest.fn(() => read.promise);
	const { container } = render(<EditProfileForm {...p} />);
	change();
	save();
	await waitFor(() => expect(p.saveAction).toHaveBeenCalledTimes(1));
	fireEvent.submit(container.querySelector('form')!);
	expect(p.saveAction).toHaveBeenCalledTimes(1);
	await act(async () => {
		pending.resolve({ status: 'success' });
		await pending.promise;
	});
	expect(screen.getByRole('button', { name: 'Сохранить' })).toBeDisabled();
	expect(warning()).toBe(true);
	await act(async () => {
		read.resolve({ status: 'success', profile: saved() });
		await read.promise;
	});
	expect(replace).toHaveBeenCalledTimes(1);
});
it.each<ProfileEditResult>([
	{ status: 'validation-error' },
	{ status: 'error' },
	{ status: 'forbidden' },
	{ status: 'sync-required' },
	{ status: 'partial-success', profile: 'confirmed', user: 'unconfirmed', reason: 'error' },
])('preserves draft and guard on Save outcome %j', async (result) => {
	const p = props();
	p.saveAction = jest.fn().mockResolvedValue(result);
	render(<EditProfileForm {...p} />);
	change();
	save();
	await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
	expect(p.readAction).not.toHaveBeenCalled();
	expect(replace).not.toHaveBeenCalled();
	expect(warning()).toBe(true);
	expect(screen.getByLabelText('Никнейм')).toHaveValue('Changed');
});
it.each(['error', 'refresh-required'])('keeps draft when readback returns %s', async (status) => {
	const p = props();
	p.readAction = jest.fn().mockResolvedValue({ status });
	render(<EditProfileForm {...p} />);
	change();
	save();
	await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
	expect(warning()).toBe(true);
	expect(replace).not.toHaveBeenCalled();
});
it.each([
	{ id: 'other' },
	{ profileId: 'other' },
	{ username: 'Mismatch' },
	{ description: '' },
	{ profileSkills: [] },
])('refuses mismatched readback %j', async (fields) => {
	const p = props();
	p.readAction = jest
		.fn()
		.mockResolvedValue({ status: 'success', profile: { ...saved(), ...fields } });
	render(<EditProfileForm {...p} />);
	change();
	save();
	await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('отличаются'));
	expect(warning()).toBe(true);
	expect(replace).not.toHaveBeenCalled();
});
it.each(['save', 'read'])('handles rejected %s safely', async (kind) => {
	const p = props();
	if (kind === 'save') p.saveAction = jest.fn().mockRejectedValue(new Error('Private'));
	else p.readAction = jest.fn().mockRejectedValue(new Error('Private'));
	render(<EditProfileForm {...p} />);
	change();
	save();
	await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
	expect(screen.queryByText('Private')).toBeNull();
	expect(warning()).toBe(true);
});
it.each(['save', 'read'])('allows auth flow on unauthorized %s', async (kind) => {
	const p = props();
	if (kind === 'save') p.saveAction = jest.fn().mockResolvedValue({ status: 'unauthorized' });
	else p.readAction = jest.fn().mockResolvedValue({ status: 'unauthorized' });
	render(<EditProfileForm {...p} />);
	change();
	save();
	await waitFor(() => expect(replace).toHaveBeenCalledWith('/auth/login'));
	expect(warning()).toBe(false);
});
it('does not overwrite a newer draft with a confirmed older snapshot', async () => {
	const read = deferred<Awaited<ReturnType<EditProfileFormProps['readAction']>>>();
	const p = props();
	p.readAction = () => read.promise;
	render(<EditProfileForm {...p} />);
	change();
	save();
	await waitFor(() => expect(p.saveAction).toHaveBeenCalledTimes(1));
	change('Newer');
	await act(async () => {
		read.resolve({ status: 'success', profile: saved() });
		await read.promise;
	});
	expect(screen.getByLabelText('Никнейм')).toHaveValue('Newer');
	expect(warning()).toBe(true);
	expect(replace).not.toHaveBeenCalled();
});
it('validates hidden fields and selects the invalid tab', async () => {
	const p = props();
	render(<EditProfileForm {...p} />);
	change('x');
	go('Навыки');
	save();
	await waitFor(() =>
		expect(screen.getByRole('tab', { name: 'Личная информация' })).toHaveAttribute(
			'aria-selected',
			'true',
		),
	);
	expect(p.saveAction).not.toHaveBeenCalled();
	expect(warning()).toBe(true);
});
it('uses the real Tiptap context and sends explicitly cleared description', async () => {
	const p = props();
	p.readAction = jest
		.fn()
		.mockResolvedValue({ status: 'success', profile: { ...saved('Name'), description: '' } });
	render(<EditProfileForm {...p} />);
	go('Обо мне');
	await waitFor(() => expect(editor()).toBeDefined());
	act(() => {
		editor().commands.clearContent();
	});
	go('Личная информация');
	save();
	await waitFor(() => expect(p.saveAction).toHaveBeenCalled());
	expect(jest.mocked(p.saveAction).mock.calls[0][0]).toHaveProperty('description', '');
	await waitFor(() => expect(replace).toHaveBeenCalledWith('/profile'));
});
it('removes hash and beforeunload listeners on unmount and ignores late readback', async () => {
	const read = deferred<Awaited<ReturnType<EditProfileFormProps['readAction']>>>();
	const p = props();
	p.readAction = () => read.promise;
	const view = render(<EditProfileForm {...p} />);
	change();
	save();
	await waitFor(() => expect(p.saveAction).toHaveBeenCalled());
	view.unmount();
	expect(warning()).toBe(false);
	await act(async () => {
		read.resolve({ status: 'success', profile: saved() });
		await read.promise;
	});
	expect(replace).not.toHaveBeenCalled();
});

it('saves avatar separately through the real slot and preserves draft after the RSC props update', async () => {
	const p = props();
	p.profile = { ...profile, avatarUrl: '/avatar.png' };
	p.avatarAction = jest.fn().mockResolvedValue({ status: 'success', avatarUrl: null });
	update.mockResolvedValue({ user: { image: null } });
	const view = render(<EditProfileForm {...p} />);
	change();
	fireEvent.click(screen.getByRole('button', { name: 'Удалить фото' }));
	await waitFor(() => expect(p.avatarAction).toHaveBeenCalledWith({ operation: 'delete' }));
	await waitFor(() =>
		expect(screen.getAllByTestId('AvatarWithoutPhoto_Wrapper').length).toBeGreaterThan(0),
	);
	expect(refresh).not.toHaveBeenCalled();
	view.rerender(<EditProfileForm {...p} profile={{ ...profile, avatarUrl: null }} />);
	expect(screen.getByLabelText('Никнейм')).toHaveValue('Changed');
	expect(p.saveAction).not.toHaveBeenCalled();
	expect(p.readAction).not.toHaveBeenCalled();
	expect(warning()).toBe(true);
});
it('registers beforeunload only while dirty and cleans both subscriptions', () => {
	const add = jest.spyOn(window, 'addEventListener');
	const remove = jest.spyOn(window, 'removeEventListener');
	const view = render(<EditProfileForm {...props()} />);
	expect(add.mock.calls.filter(([name]) => name === 'beforeunload')).toHaveLength(0);
	change();
	expect(add.mock.calls.filter(([name]) => name === 'beforeunload')).toHaveLength(1);
	change('Name');
	expect(remove.mock.calls.filter(([name]) => name === 'beforeunload')).toHaveLength(1);
	go('Навыки');
	expect(warning()).toBe(false);
	view.unmount();
	expect(remove.mock.calls.some(([name]) => name === 'hashchange')).toBe(true);
	add.mockRestore();
	remove.mockRestore();
});
it('keeps the draft clean when Tiptap loads and normalizes unchanged raw HTML', async () => {
	const p = props();
	render(<EditProfileForm {...p} />);
	go('Обо мне');
	await waitFor(() => expect(editor()).toBeDefined());
	expect(warning()).toBe(false);
	go('Личная информация');
	expect(warning()).toBe(false);
});

it('disables all native form controls and Save in server HTML before hydration', () => {
	const html = renderToString(
		<NextIntlClientProvider locale="ru" messages={{}}>
			<EditProfileForm {...props()} />
		</NextIntlClientProvider>,
	);
	const template = document.createElement('template');
	template.innerHTML = html;
	expect(template.content.querySelector('fieldset')?.hasAttribute('disabled')).toBe(true);
	expect(template.content.querySelector('button[type="submit"]')?.hasAttribute('disabled')).toBe(
		true,
	);
});

it('renders one localized profile breadcrumb before the editing card', () => {
	const view = render(<EditProfileForm {...props()} />);
	const nav = screen.getByRole('navigation', { name: 'Редактирование профиля' });
	const link = screen.getByRole('link', { name: 'Профиль' });
	expect(link).toHaveAttribute('href', '/ru/profile');
	expect(view.container.querySelectorAll('nav')).toHaveLength(1);
	expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent('Редактирование профиля');
	expect(
		nav.compareDocumentPosition(screen.getByRole('heading', { name: 'Редактирование профиля' })) &
			Node.DOCUMENT_POSITION_FOLLOWING,
	).toBeTruthy();
	expect(view.container.querySelector('form')?.contains(nav)).toBe(false);
	link.focus();
	expect(link).toHaveFocus();
});
it('uses React tab typography, spacing and responsive breadcrumb composition', () => {
	render(<EditProfileForm {...props()} />);
	for (const tab of screen.getAllByRole('tab')) expect(tab.querySelector('p')).toHaveClass('body4');
	const css = readFileSync(
		join(process.cwd(), 'src/widgets/profile/edit/ui/EditProfileForm.module.css'),
		'utf8',
	);
	expect(css).toMatch(/\.list\s*\{[^}]*gap: 10px;[^}]*padding: 10px;/);
	expect(css).toMatch(/\.tab\s*\{[^}]*padding: 10px;/);
	expect(css).toMatch(/\.breadcrumbs\s*\{[^}]*margin: 0 0 24px;[^}]*height: 27px;/);
	expect(css).toMatch(/@media \(width <= 767px\)/);
	expect(css).toMatch(/\.crumb-current\s*\{[^}]*display: none;/);
	expect(css).toMatch(/\.crumb-back\s*\{[^}]*transform: rotate\(180deg\);/);
});
