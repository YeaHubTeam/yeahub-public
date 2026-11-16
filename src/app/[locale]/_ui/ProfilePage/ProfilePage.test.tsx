/** @jest-environment node */
import type { ReactNode } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';

import { ProfileAbout } from '@/widgets/profile/about';
import { ProfileSkills } from '@/widgets/profile/skills';
import { UserCard } from '@/widgets/profile/userCard';

import ProfilePage from './ProfilePage';

jest.mock('./ProfileStatus', () => ({
	ProfileAccessBoundary: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('@/widgets/profile/userCard', () => ({ UserCard: jest.fn(() => <div>User card</div>) }));
jest.mock('@/widgets/profile/about', () => ({
	ProfileAbout: jest.fn(() => <div>About card</div>),
}));
jest.mock('@/widgets/profile/skills', () => ({
	ProfileSkills: jest.fn(() => <div>Skills card</div>),
}));
it('composes the three widget public APIs in order and passes only their data', () => {
	const profile = {
		id: 'user',
		username: 'Name',
		avatarUrl: null,
		birthday: null,
		country: null,
		city: null,
		email: '',
		isVerified: false,
		userRoles: [],
		activeProfile: {
			id: 'profile',
			specializationId: 11,
			description: '<p>About</p>',
			profileSkills: [{ id: 1, title: 'JS', imageSrc: null }],
			socialNetwork: [],
		},
	};
	const avatarAction = jest.fn();
	const html = renderToStaticMarkup(
		<ProfilePage profile={profile} specialization={null} avatarAction={avatarAction} />,
	);
	expect(html.indexOf('User card')).toBeLessThan(html.indexOf('About card'));
	expect(html.indexOf('About card')).toBeLessThan(html.indexOf('Skills card'));
	expect(UserCard).toHaveBeenCalledWith({ profile, specialization: null, avatarAction }, undefined);
	expect(ProfileAbout).toHaveBeenCalledWith({ description: '<p>About</p>' }, undefined);
	expect(ProfileSkills).toHaveBeenCalledWith(
		{ skillsList: profile.activeProfile.profileSkills },
		undefined,
	);
});
