/** @jest-environment node */
import { notFound } from 'next/navigation';

import { getOwnProfile } from '@/auth';
import { getSpecializationById } from '@/entities/specialization';
import { redirect } from '@/shared/config';

import { changeOwnAvatar } from '../../(public)/profile/actions';
import Page, { dynamic, metadata, runtime } from '../../(public)/profile/page';
import ProfilePage from './ProfilePage';
import { ProfileStatus } from './ProfileStatus';

jest.mock('@/auth', () => ({ getOwnProfile: jest.fn() }));
jest.mock('@/entities/specialization', () => ({ getSpecializationById: jest.fn() }));
jest.mock('@/shared/config', () => ({
	ROUTES: { auth: { login: { page: '/auth/login' } } },
	routing: { locales: ['ru'] },
	redirect: jest.fn(() => {
		throw new Error('LOGIN');
	}),
}));
jest.mock('next/navigation', () => ({
	notFound: jest.fn(() => {
		throw new Error('NOT_FOUND');
	}),
}));
jest.mock('../../(public)/profile/actions', () => ({ changeOwnAvatar: jest.fn() }));
jest.mock('./ProfilePage', () => ({ __esModule: true, default: jest.fn(() => null) }));
jest.mock('./ProfileStatus', () => ({ ProfileStatus: jest.fn(() => null) }));
const profile = {
	id: 'user-a',
	username: 'Nickname',
	avatarUrl: null,
	birthday: null,
	country: null,
	city: null,
	email: 'test@example.invalid',
	isVerified: true,
	userRoles: [],
	activeProfile: {
		id: 'profile-a',
		specializationId: 11,
		description: 'About',
		profileSkills: [],
		socialNetwork: [],
	},
};
const request = (locale = 'ru') => Page({ params: Promise.resolve({ locale }) });
beforeEach(() => {
	jest.clearAllMocks();
	jest.mocked(getOwnProfile).mockResolvedValue({ status: 'success', profile });
	jest
		.mocked(getSpecializationById)
		.mockResolvedValue({ id: 11, title: 'Frontend', slug: 'frontend', description: '' });
});
it('builds the supported localized route with the real Action reference', async () => {
	const page = await request();
	expect(page.type).toBe(ProfilePage);
	expect(page.props).toEqual({
		profile,
		specialization: { id: 11, title: 'Frontend' },
		avatarAction: changeOwnAvatar,
	});
	expect(getOwnProfile).toHaveBeenCalledTimes(1);
	expect(getSpecializationById).toHaveBeenCalledWith(11);
	expect(JSON.stringify(page.props)).not.toMatch(/accessToken|refreshToken|backendSession/);
});
it('rejects unsupported locale before reading private data', async () => {
	await expect(request('en')).rejects.toThrow('NOT_FOUND');
	expect(notFound).toHaveBeenCalledTimes(1);
	expect(getOwnProfile).not.toHaveBeenCalled();
});
it('redirects a guest or backend 401 to localized login', async () => {
	jest.mocked(getOwnProfile).mockResolvedValue({ status: 'unauthenticated' });
	await expect(request()).rejects.toThrow('LOGIN');
	expect(redirect).toHaveBeenCalledWith({ href: '/auth/login', locale: 'ru' });
});
it.each(['refresh-required', 'no-active-profile', 'error', 'identity-mismatch'] as const)(
	'renders safe state %s without private widgets',
	async (status) => {
		jest.mocked(getOwnProfile).mockResolvedValue({ status });
		const page = await request();
		expect(page.type).toBe(ProfileStatus);
		expect(page.props.kind).toBe(status === 'identity-mismatch' ? 'error' : status);
		expect(getSpecializationById).not.toHaveBeenCalled();
	},
);
it('handles unexpected loading failures without exposing exceptions', async () => {
	jest.mocked(getOwnProfile).mockRejectedValue(new Error('private backend diagnostic'));
	const page = await request();
	expect(page.props).toEqual({ kind: 'error' });
});
it('keeps specialization absent when its public lookup fails', async () => {
	jest.mocked(getSpecializationById).mockRejectedValue(new Error('unavailable'));
	expect((await request()).props.specialization).toBeNull();
});
it('does not substitute another specialization or the numeric ID', async () => {
	jest
		.mocked(getSpecializationById)
		.mockResolvedValue({ id: 12, title: 'Other', slug: 'other', description: '' });
	expect((await request()).props.specialization).toBeNull();
});
it('handles an unselected specialization without a request', async () => {
	jest.mocked(getOwnProfile).mockResolvedValue({
		status: 'success',
		profile: { ...profile, activeProfile: { ...profile.activeProfile, specializationId: 0 } },
	});
	expect((await request()).props.specialization).toBeNull();
	expect(getSpecializationById).not.toHaveBeenCalled();
});
it('requires dynamic Node rendering and excludes private metadata from indexing', () => {
	expect(dynamic).toBe('force-dynamic');
	expect(runtime).toBe('nodejs');
	expect(metadata.robots).toMatchObject({ index: false, follow: false });
	expect(JSON.stringify(metadata)).not.toMatch(/Nickname|test@example/);
});
