import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { hasLocale } from 'next-intl';

import { getOwnProfile } from '@/app/_bff/profile/index.server';
import { getSpecializationById } from '@/entities/specialization';
import { ROUTES, redirect, routing } from '@/shared/config';

import ProfilePage from '../../_ui/ProfilePage/ProfilePage';
import { ProfileStatus } from '../../_ui/ProfilePage/ProfileStatus';
import { changeOwnAvatar } from './actions';

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
	const id = result.profile.activeProfile.specializationId;
	let specialization: { id: number; title: string } | null = null;
	if (id > 0) {
		try {
			const value = await getSpecializationById(id);
			if (value?.id === id && typeof value.title === 'string' && value.title.trim())
				specialization = { id: value.id, title: value.title };
		} catch {
			/* The profile remains usable without the public specialization title. */
		}
	}
	return (
		<ProfilePage
			profile={result.profile}
			specialization={specialization}
			avatarAction={changeOwnAvatar}
		/>
	);
};

export default Page;
