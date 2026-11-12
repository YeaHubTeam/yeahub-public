import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import type { OwnProfile } from '@/entities/profile';

import { UserCard } from '../index';

jest.mock('@/shared/config', () => ({
	...jest.requireActual('@/shared/config/i18n/i18nTranslations'),
	i18Namespace: { profile: 'profile', translation: 'translation' },
	useRouter: () => ({ refresh: jest.fn() }),
}));
jest.mock('@/shared/config/navigation', () => ({ useRouter: () => ({ refresh: jest.fn() }) }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ update: jest.fn() }) }));
jest.mock('next-intl', () => ({
	useTranslations: (namespace: string) => {
		const { createTranslator } = jest.requireActual('next-intl');
		return createTranslator({
			locale: 'ru',
			messages: jest.requireActual(`public/locales/ru/${namespace}.json`),
		});
	},
}));

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
