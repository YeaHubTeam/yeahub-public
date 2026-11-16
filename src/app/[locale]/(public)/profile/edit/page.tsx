import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { hasLocale } from 'next-intl';

import { getOwnProfile } from '@/app/_bff/profile/index.server';
import { getSkills } from '@/entities/skill';
import { getSpecializationById, getSpecializations } from '@/entities/specialization';
import { ROUTES, redirect, routing } from '@/shared/config';
import { EditProfileForm } from '@/widgets/profile/edit';
import type { EditProfileFormProps } from '@/widgets/profile/edit';

import { ProfileAccessBoundary, ProfileStatus } from '../../../_ui/ProfilePage/ProfileStatus';
import { changeOwnAvatar } from '../actions';
import { readSavedProfile, saveProfile } from './actions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const metadata: Metadata = {
	robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

const Page = async ({ params }: { params: Promise<{ locale: string }> }) => {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) notFound();
	let result: Awaited<ReturnType<typeof getOwnProfile>>;
	try {
		result = await getOwnProfile();
	} catch {
		return <ProfileStatus kind="error" />;
	}
	if (result.status === 'unauthenticated') redirect({ href: ROUTES.auth.login.page, locale });
	if (result.status === 'refresh-required') return <ProfileStatus kind="refresh-required" />;
	if (result.status === 'no-active-profile') return <ProfileStatus kind="no-active-profile" />;
	if (result.status !== 'success') return <ProfileStatus kind="error" />;
	const profile = result.profile;
	const [specializationResult, skillsResult, optionsResult] = await Promise.allSettled([
		profile.activeProfile.specializationId > 0
			? getSpecializationById(profile.activeProfile.specializationId)
			: Promise.resolve(null),
		getSkills({ limit: 100 }),
		profile.activeProfile.specializationId === 0
			? getSpecializations({ limit: 100 })
			: Promise.resolve(null),
	]);
	let specialization: EditProfileFormProps['specialization'] = null;
	if (specializationResult.status === 'fulfilled') {
		const value = specializationResult.value;
		if (
			value?.id === profile.activeProfile.specializationId &&
			typeof value.title === 'string' &&
			value.title.trim()
		)
			specialization = { id: value.id, title: value.title };
	}
	let specializationOptions: NonNullable<EditProfileFormProps['specializationOptions']> = [];
	let specializationError = profile.activeProfile.specializationId === 0;
	if (optionsResult.status === 'fulfilled' && Array.isArray(optionsResult.value?.data)) {
		const options = optionsResult.value.data;
		if (
			options.length > 0 &&
			options.every(
				(option) =>
					option &&
					Number.isSafeInteger(option.id) &&
					option.id > 0 &&
					typeof option.title === 'string' &&
					option.title.trim(),
			) &&
			new Set(options.map((option) => option.id)).size === options.length
		) {
			specializationOptions = options.map(({ id, title }) => ({ id, title }));
			specializationError = false;
		}
	}
	let skills: EditProfileFormProps['skills'] = [];
	let skillsError = true;
	if (skillsResult.status === 'fulfilled' && Array.isArray(skillsResult.value?.data)) {
		const data = skillsResult.value.data;
		if (
			data.every(
				(skill) =>
					skill &&
					Number.isSafeInteger(skill.id) &&
					skill.id > 0 &&
					typeof skill.title === 'string' &&
					skill.title.length > 0 &&
					(skill.imageSrc == null || typeof skill.imageSrc === 'string'),
			)
		) {
			skills = data.map(({ id, title, imageSrc }) => ({ id, title, imageSrc: imageSrc ?? null }));
			skillsError = false;
		}
	}
	return (
		<ProfileAccessBoundary userId={profile.id}>
			<EditProfileForm
				profile={profile}
				specialization={specialization}
				skills={skills}
				skillsError={skillsError}
				specializationOptions={specializationOptions}
				specializationError={specializationError}
				avatarAction={changeOwnAvatar}
				saveAction={saveProfile}
				readAction={readSavedProfile}
			/>
		</ProfileAccessBoundary>
	);
};

export default Page;
