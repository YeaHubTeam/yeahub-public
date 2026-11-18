import 'server-only';

import { readSettingsSnapshot } from '@/entities/profile/index.server';
import type { PersonalQuestionsData, PersonalQuestionsInput } from '@/entities/question';
import { isPersonalQuestionsInput, readPersonalQuestions } from '@/entities/question/index.server';
import { getSpecializationById } from '@/entities/specialization';
import { getAuthBackendConfig } from '@/shared/config/index.server';

import { currentBackendSession } from '../../_auth/session.server';

type Owner = { userId: string; profileId: string; hasPremiumAccess: boolean; isVerified: boolean };
export type OwnQuestionsListResult =
	| ({ status: 'success'; list: PersonalQuestionsData } & Owner)
	| ({ status: 'redirect'; specializationSlug: string } & Owner)
	| ({ status: 'premium-required'; hasPremiumAccess: false } & Owner)
	| { status: 'unauthenticated' | 'refresh-required' | 'forbidden' | 'identity-mismatch' | 'no-active-profile' | 'invalid-input' | 'error' };

export const getOwnQuestionsList = async (input: PersonalQuestionsInput): Promise<OwnQuestionsListResult> => {
	if (!isPersonalQuestionsInput(input)) return { status: 'invalid-input' };
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	return readOwnQuestionsList(input, session);
};

// Source selection happens before any list HTTP request. An expired/invalid cookie
// is unauthenticated; other session failures must not fall back to public data.
export const selectQuestionsListSource = async (input: PersonalQuestionsInput) => {
	const session = await currentBackendSession();
	if (session.status === 'unauthenticated') return { source: 'public' as const };
	if (session.status !== 'success')
		return { source: 'personal' as const, userId: null, result: session };
	const result: OwnQuestionsListResult = isPersonalQuestionsInput(input)
		? await readOwnQuestionsList(input, session)
		: { status: 'invalid-input' };
	return { source: 'personal' as const, userId: session.data.userId, result };
};

const readOwnQuestionsList = async (
	input: PersonalQuestionsInput,
	session: Extract<Awaited<ReturnType<typeof currentBackendSession>>, { status: 'success' }>,
): Promise<OwnQuestionsListResult> => {
	try {
		const config = getAuthBackendConfig();
		const credentials = { userId: session.data.userId, accessToken: session.data.accessToken };
		const before = await readSettingsSnapshot(credentials, config);
		if (before.status !== 'success') return before;
		const active = before.snapshot.profiles.find(profile => profile.id === before.snapshot.activeProfileId && profile.isActive);
		if (!active) return { status: 'no-active-profile' };
		const owner = { userId: credentials.userId, profileId: active.id, hasPremiumAccess: before.snapshot.hasPremiumAccess, isVerified: before.snapshot.isVerified };
		// The route can never select another specialization for this profile.
		if (active.specializationId !== input.specializationId) {
			const specialization = await getSpecializationById(active.specializationId);
			if (specialization.id !== active.specializationId || typeof specialization.slug !== 'string' || !/^[a-z0-9-]+$/.test(specialization.slug)) return { status: 'error' };
			return { status: 'redirect', ...owner, specializationSlug: specialization.slug };
		}
		if ((input.status === 'learned' || input.status === 'not-learned') && !owner.hasPremiumAccess) return { status: 'premium-required', ...owner, hasPremiumAccess: false };
		const result = await readPersonalQuestions(input, { profileId: active.id, accessToken: credentials.accessToken }, config);
		if (result.status !== 'success') return result;
		const after = await readSettingsSnapshot(credentials, config);
		if (after.status !== 'success') return after;
		const fresh = await currentBackendSession();
		if (fresh.status !== 'success') return fresh;
		if (fresh.data.userId !== owner.userId || after.snapshot.activeProfileId !== owner.profileId || !after.snapshot.profiles.some(profile => profile.id === owner.profileId && profile.isActive && profile.specializationId === active.specializationId)) return { status: 'identity-mismatch' };
		if ((input.status === 'learned' || input.status === 'not-learned') && !after.snapshot.hasPremiumAccess) return { status: 'premium-required', ...owner, hasPremiumAccess: false };
		return { status: 'success', ...owner, hasPremiumAccess: after.snapshot.hasPremiumAccess, isVerified: after.snapshot.isVerified, list: result.list };
	} catch {
		return { status: 'error' };
	}
};
