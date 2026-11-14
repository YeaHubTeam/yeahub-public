/** @jest-environment node */
import type { ReactElement } from 'react';

import { getOwnProfile } from '@/auth';
import { getSkills } from '@/entities/skill';
import { getSpecializationById, getSpecializations } from '@/entities/specialization';
import type { EditProfileFormProps } from '@/widgets/profile/edit';

import Page from './page';

jest.mock('@/auth', () => ({ getOwnProfile: jest.fn() }));
jest.mock('@/entities/skill', () => ({ getSkills: jest.fn() }));
jest.mock('@/entities/specialization', () => ({
	getSpecializationById: jest.fn(),
	getSpecializations: jest.fn(),
}));
jest.mock('@/widgets/profile/edit', () => ({ EditProfileForm: () => null }));
jest.mock('../actions', () => ({ changeOwnAvatar: jest.fn() }));
jest.mock('./actions', () => ({ saveProfile: jest.fn(), readSavedProfile: jest.fn() }));
jest.mock('../../../_ui/ProfilePage/ProfileStatus', () => ({
	ProfileAccessBoundary: () => null,
	ProfileStatus: () => null,
}));
jest.mock('@/shared/config', () => ({
	ROUTES: { auth: { login: { page: '/auth/login' } } },
	routing: { locales: ['ru'] },
	redirect: jest.fn(() => {
		throw new Error('LOGIN');
	}),
}));
jest.mock('next/navigation', () => ({
	notFound: () => {
		throw new Error('NOT_FOUND');
	},
}));
const loaded = (specializationId = 0) => ({
	status: 'success' as const,
	profile: {
		id: 'user',
		username: 'Name',
		email: 'private@example.invalid',
		avatarUrl: null,
		city: null,
		birthday: null,
		country: null,
		isVerified: true,
		userRoles: [],
		activeProfile: {
			id: 'active',
			isActive: true,
			specializationId,
			description: null,
			profileSkills: [],
			socialNetwork: [],
		},
	},
});
const request = () => Page({ params: Promise.resolve({ locale: 'ru' }) });
const child = (page: unknown) =>
	(page as ReactElement<{ children: ReactElement<EditProfileFormProps> }>).props.children.props;
beforeEach(() => {
	jest.mocked(getOwnProfile).mockResolvedValue(loaded());
	jest.mocked(getSkills).mockResolvedValue({ data: [], total: 0, limit: 100, page: 1 });
	jest.mocked(getSpecializations).mockResolvedValue({
		data: [{ id: 7, title: 'Backend developer', slug: 'backend', description: '' }],
		total: 1,
	} as Awaited<ReturnType<typeof getSpecializations>>);
});
it('loads safe server-first options for a new profile without exposing extra directory fields', async () => {
	const props = child(await request());
	expect(props.specializationOptions).toEqual([{ id: 7, title: 'Backend developer' }]);
	expect(props.specializationError).toBe(false);
	expect(getSpecializations).toHaveBeenCalledTimes(1);
	expect(getSpecializations).toHaveBeenCalledWith({ limit: 100 });
	expect(getSpecializationById).not.toHaveBeenCalled();
	expect(getOwnProfile).toHaveBeenCalledTimes(1);
});
it('does not load selection options for an established specialization', async () => {
	jest.mocked(getOwnProfile).mockResolvedValue(loaded(7));
	jest
		.mocked(getSpecializationById)
		.mockResolvedValue({ id: 7, title: 'Backend developer' } as Awaited<
			ReturnType<typeof getSpecializationById>
		>);
	const props = child(await request());
	expect(props.specialization).toEqual({ id: 7, title: 'Backend developer' });
	expect(props.specializationOptions).toEqual([]);
	expect(props.specializationError).toBe(false);
	expect(getSpecializations).not.toHaveBeenCalled();
});
it('reports directory failure without replacing it with fabricated options', async () => {
	jest.mocked(getSpecializations).mockRejectedValue(new Error('Private'));
	const props = child(await request());
	expect(props.specializationOptions).toEqual([]);
	expect(props.specializationError).toBe(true);
});
it.each(
	[
		[],
		[{ id: 0, title: 'Invalid' }],
		[{ id: '7', title: 'Invalid' }],
		[{ id: 7, title: '' }],
		[
			{ id: 7, title: 'One' },
			{ id: 7, title: 'Duplicate' },
		],
	].map((data) => [data]),
)('fails closed for malformed or empty options (%#)', async (data) => {
	jest
		.mocked(getSpecializations)
		.mockResolvedValue({ data } as Awaited<ReturnType<typeof getSpecializations>>);
	const props = child(await request());
	expect(props.specializationOptions).toEqual([]);
	expect(props.specializationError).toBe(true);
});
it.each(['unauthenticated', 'refresh-required', 'no-active-profile', 'error'] as const)(
	'preserves access guard: %s',
	async (status) => {
		jest.mocked(getOwnProfile).mockResolvedValue({ status });
		if (status === 'unauthenticated') await expect(request()).rejects.toThrow('LOGIN');
		else expect((await request()).props.kind).toBe(status);
		expect(getSpecializations).not.toHaveBeenCalled();
		expect(getSkills).not.toHaveBeenCalled();
	},
);
