import type { ReactElement, ReactNode } from 'react';

import '@testing-library/jest-dom';
import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { OwnProfile } from '@/entities/profile';

import { UserCard } from '../index';

jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config/i18n/i18nTranslations'),
	i18Namespace: { profile: 'profile', translation: 'translation' },
	ROUTES: { profile: { page: '/profile' } },
	Link: jest.requireActual('@/shared/config/navigation').Link,
	useRouter: () => ({ refresh: jest.fn() }),
}));
jest.mock('@/shared/config/navigation', () => ({
	...jest.requireActual('@/shared/config/navigation'),
	useRouter: () => ({ refresh: jest.fn() }),
}));
jest.mock('next/navigation', () => ({
	usePathname: () => '/ru/profile',
	useRouter: () => ({ refresh: jest.fn(), push: jest.fn(), replace: jest.fn() }),
}));
jest.mock('next-auth/react', () => ({ useSession: () => ({ update: jest.fn() }) }));
jest.mock('next-intl', () => ({
	...jest.requireActual('next-intl'),
	useTranslations: (namespace: string) => {
		const { createTranslator } = jest.requireActual('next-intl');
		return createTranslator({
			locale: 'ru',
			messages: jest.requireActual(`public/locales/ru/${namespace}.json`),
		});
	},
}));

const LocaleWrapper = ({ children }: { children: ReactNode }) => (
	<NextIntlClientProvider locale="ru" messages={{}}>
		{children}
	</NextIntlClientProvider>
);
const render = (ui: ReactElement) => renderBase(ui, { wrapper: LocaleWrapper });

const profile = (): OwnProfile => ({
	id: 'user-a',
	username: 'Nickname',
	avatarUrl: 'https://images.example/avatar.png',
	birthday: '2000-01-01',
	country: 'Россия',
	city: 'Москва',
	email: 'test@example.invalid',
	isVerified: true,
	userRoles: [{ id: 1, name: 'candidate-premium' }],
	activeProfile: {
		id: 'profile-a',
		specializationId: 987654,
		description: null,
		profileSkills: [],
		socialNetwork: [{ code: 'github', title: 'https://github.com/example' }],
	},
});
const specialization = { id: 987654, title: 'Frontend' };
const originalFetch = globalThis.fetch;
const fetchMock = jest.fn();
beforeEach(() => {
	jest.useFakeTimers().setSystemTime(new Date('2026-01-02T12:00:00Z'));
	globalThis.fetch = fetchMock;
	fetchMock.mockReset();
});
afterEach(() => {
	expect(fetchMock).not.toHaveBeenCalled();
	globalThis.fetch = originalFetch;
	jest.useRealTimers();
});

it('renders the real card with full data and specialization title', () => {
	render(<UserCard profile={profile()} specialization={specialization} />);
	for (const text of [
		'Nickname',
		'26 лет',
		'Участник',
		'Frontend',
		'Россия, Москва',
		'test@example.invalid',
	]) {
		expect(screen.getByText(text)).toBeInTheDocument();
	}
	expect(screen.getByRole('img', { name: 'E-mail подтвержден' })).toBeInTheDocument();
	expect(screen.getByRole('img', { name: 'Аватар' })).toHaveAttribute(
		'src',
		'https://images.example/avatar.png',
	);
	expect(screen.queryByText('987654')).not.toBeInTheDocument();
});

it('uses the existing avatar fallback', () => {
	render(<UserCard profile={{ ...profile(), avatarUrl: null }} specialization={null} />);
	expect(screen.getByTestId('AvatarWithoutPhoto_Wrapper')).toBeInTheDocument();
	expect(screen.queryByText('Frontend')).not.toBeInTheDocument();
	expect(screen.queryByText('987654')).not.toBeInTheDocument();
});

it.each([null, 'invalid', '2999-01-01'])(
	'omits age for an absent or invalid birthday: %s',
	(birthday) => {
		render(<UserCard profile={{ ...profile(), birthday }} specialization={null} />);
		expect(screen.queryByText(/26 лет/)).not.toBeInTheDocument();
		expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
	},
);

it.each([
	[null, null, null],
	['Россия', null, 'Россия'],
	[null, 'Москва', 'Москва'],
])('handles partial location %#', (country, city, expected) => {
	const { container } = render(
		<UserCard profile={{ ...profile(), country, city }} specialization={null} />,
	);
	if (expected) expect(screen.getByText(expected)).toBeInTheDocument();
	expect(container.textContent).not.toMatch(/undefined|null/);
});

it('shows unverified email without a settings link', () => {
	render(<UserCard profile={{ ...profile(), isVerified: false }} specialization={null} />);
	expect(screen.getByText('test@example.invalid')).toBeInTheDocument();
	expect(screen.getByText('Подтвердить e-mail')).toBeInTheDocument();
	expect(screen.getByRole('img', { name: 'E-mail не подтвержден' })).toBeInTheDocument();
	expect(screen.queryByRole('link', { name: /Подтвердить/ })).not.toBeInTheDocument();
});

it('renders translated roles with their original variants and handles unknown roles', () => {
	const value = profile();
	value.userRoles = [
		{ id: 1, name: 'admin' },
		{ id: 2, name: 'candidate-free' },
		{ id: 3, name: 'custom' },
	];
	render(<UserCard profile={value} specialization={null} />);
	for (const text of ['Админ', 'Кандидат', 'custom'])
		expect(screen.getByText(text)).toBeInTheDocument();
});

it('allows only safe absolute external links with protection for a new tab', () => {
	const value = profile();
	value.activeProfile.socialNetwork.push(
		{ code: 'telegram', title: 'javascript:alert(1)' },
		{ code: 'twitter', title: 'https://user:password@example.invalid' },
		{ code: 'facebook', title: '/settings' },
		{ code: 'vk', title: 'https://example.invalid/profile' },
	);
	render(<UserCard profile={value} specialization={null} />);
	const links = screen.getAllByRole('link');
	expect(links).toHaveLength(2);
	for (const link of links) {
		expect(link).toHaveAttribute('target', '_blank');
		expect(link).toHaveAttribute('rel', 'noopener noreferrer');
	}
	expect(screen.getByRole('link', { name: 'Открыть профиль: github' })).toHaveAttribute(
		'href',
		'https://github.com/example',
	);
});

it('updates from new props and contains no edit, avatar mutation or legacy navigation', () => {
	const value = profile();
	const { container, rerender } = render(
		<UserCard profile={value} specialization={specialization} />,
	);
	rerender(
		<UserCard
			profile={{ ...value, username: 'New nickname', userRoles: [], email: '', avatarUrl: null }}
			specialization={null}
		/>,
	);
	expect(screen.getByText('New nickname')).toBeInTheDocument();
	expect(screen.queryByText('Nickname')).not.toBeInTheDocument();
	expect(screen.queryByText('Frontend')).not.toBeInTheDocument();
	expect(
		container.querySelector(
			'a[href*="/settings"], a[href*="/profile/edit"], a[href*="app.yeahub.ru"]',
		),
	).toBeNull();
	expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('renders long text and incomplete optional data without losing the text', () => {
	const value = {
		...profile(),
		username: 'Nickname'.repeat(50),
		email: `${'a'.repeat(200)}@example.invalid`,
		userRoles: [],
	};
	value.activeProfile.socialNetwork = [];
	const { container } = render(<UserCard profile={value} specialization={null} />);
	expect(screen.getByText(value.username)).toBeInTheDocument();
	expect(screen.getByText(value.email)).toBeInTheDocument();
	expect(container.querySelectorAll('a')).toHaveLength(0);
});

it('enables avatar controls only when a callback is explicitly provided', () => {
	const avatarAction = jest.fn();
	render(
		<UserCard
			profile={{ ...profile(), avatarUrl: null }}
			specialization={null}
			avatarAction={avatarAction}
		/>,
	);
	expect(screen.getByRole('button', { name: 'Добавить фотографию' })).toBeInTheDocument();
	expect(avatarAction).not.toHaveBeenCalled();
});

it('renders exactly one localized edit link only with own-profile actions', () => {
	const avatarAction = jest.fn();
	const view = render(
		<UserCard profile={profile()} specialization={specialization} avatarAction={avatarAction} />,
	);
	const links = screen.getAllByRole('link', { name: 'Редактирование профиля' });
	expect(links).toHaveLength(1);
	expect(links[0]).toHaveAttribute('href', '/ru/profile/edit#personal-information');
	expect(links[0]).toHaveClass('edit');
	expect(links[0].querySelector('svg')).toHaveAttribute('width', '20');
	expect(links[0].querySelector('svg')).toHaveAttribute('height', '20');
	expect(links[0].querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
	expect(links[0].querySelector('svg')).toHaveStyle({ color: 'var(--color-purple-700)' });
	view.rerender(<UserCard profile={profile()} specialization={specialization} />);
	expect(screen.queryByRole('link', { name: 'Редактирование профиля' })).toBeNull();
	expect(avatarAction).not.toHaveBeenCalled();
});
it('keeps native link focus and Enter activation without calling avatar mutation', async () => {
	const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
	const avatarAction = jest.fn();
	render(<UserCard profile={profile()} specialization={null} avatarAction={avatarAction} />);
	const link = screen.getByRole('link', { name: 'Редактирование профиля' });
	const activate = jest.fn((event: Event) => event.preventDefault());
	link.addEventListener('click', activate);
	link.focus();
	expect(link).toHaveFocus();
	expect(link.tabIndex).toBe(0);
	await user.keyboard('{Enter}');
	expect(activate).toHaveBeenCalledTimes(1);
	expect(link).toHaveAttribute('href', '/ru/profile/edit#personal-information');
	expect(avatarAction).not.toHaveBeenCalled();
});
it('keeps passive images in their original fixed frame and preserves the placeholder', () => {
	const view = render(<UserCard profile={profile()} specialization={null} />);
	const image = screen.getByRole('img', { name: 'Аватар' });
	expect(image).toHaveAttribute('width', '170');
	expect(image).toHaveAttribute('height', '188');
	expect(image).toHaveClass('image');
	expect(image.parentElement).toHaveClass('avatar');
	view.rerender(<UserCard profile={{ ...profile(), avatarUrl: null }} specialization={null} />);
	expect(screen.getByTestId('AvatarWithoutPhoto_Wrapper').parentElement).toHaveClass('avatar');
});

it('retains the local frame, cover sizing, mobile composition and visible focus contract', () => {
	const css = readFileSync(
		join(process.cwd(), 'src/widgets/profile/userCard/ui/UserCard.module.css'),
		'utf8',
	);
	expect(css).toMatch(
		/\.avatar\s*\{[^}]*width: 170px;[^}]*height: 188px;[^}]*overflow: hidden;[^}]*border-radius: 20px;/,
	);
	expect(css).toMatch(
		/\.image\s*\{[^}]*display: block;[^}]*width: 100%;[^}]*height: 100%;[^}]*object-fit: cover;/,
	);
	expect(css).toMatch(/\.edit:focus-visible\s*\{[^}]*outline: 2px solid/);
	expect(css).toContain('@media (width <= 768px)');
	expect(css).toMatch(/\.user-data\s*\{[^}]*flex-direction: column;[^}]*order: 2;/);
	expect(css).toMatch(/\.edit\s*\{[^}]*order: 1;/);
});
