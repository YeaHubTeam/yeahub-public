import 'server-only';

import { backendHttp } from '@/shared/api/index.server';

import type {
	PersonalQuestionsData,
	PersonalQuestionsInput,
	QuestionListItem,
} from '../model/types/personalList';

export type PersonalQuestionsRead =
	| { status: 'success'; list: PersonalQuestionsData }
	| { status: 'unauthenticated' | 'forbidden' | 'error' };

const object = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

// Validate at the server boundary too: an Action may be called without our UI.
export const isPersonalQuestionsInput = (value: unknown): value is PersonalQuestionsInput => {
	if (!object(value) || typeof value.status !== 'string' || !['all', 'favorite', 'learned', 'not-learned'].includes(value.status))
		return false;
	if (
		!Number.isSafeInteger(value.page) ||
		(value.page as number) < 1 ||
		(value.page as number) > Math.floor(Number.MAX_SAFE_INTEGER / 10)
	)
		return false;
	if (!Number.isSafeInteger(value.specializationId) || (value.specializationId as number) < 1)
		return false;
	const fields = ['status', 'page', 'specializationId', 'title', 'titleOrDescription', 'skills', 'complexity', 'rate', 'order', 'orderBy'];
	if (Object.keys(value).some((key) => !fields.includes(key))) return false;
	for (const key of ['title', 'titleOrDescription']) {
		if (value[key] !== undefined && (typeof value[key] !== 'string' || (value[key] as string).length > 1000))
			return false;
	}
	for (const key of ['skills', 'complexity', 'rate']) {
		const field = value[key];
		if (
			field !== undefined &&
			(typeof field !== 'string' || field.length > 1000 ||
				!/^[1-9]\d*(,[1-9]\d*)*$/.test(field) ||
				field.split(',').some((id) => !Number.isSafeInteger(Number(id))))
		)
			return false;
	}
	return (value.order === undefined || value.order === 'ASC' || value.order === 'DESC') &&
		(value.orderBy === undefined || value.orderBy === 'title' || value.orderBy === 'complexity' || value.orderBy === 'rate');
};

export const readPersonalQuestions = async (
	input: PersonalQuestionsInput,
	credentials: { profileId: string; accessToken: string },
	config: { apiOrigin: string; allowedOrigins: readonly string[] },
): Promise<PersonalQuestionsRead> => {
	if (
		!isPersonalQuestionsInput(input) ||
		!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(credentials.profileId) ||
		!/^[A-Za-z0-9._~-]+$/.test(credentials.accessToken)
	)
		return { status: 'error' };
	const learned = input.status === 'learned' || input.status === 'not-learned';
	const query = new URLSearchParams({
		page: String(input.page), limit: '10', profileId: credentials.profileId,
		specializationId: String(input.specializationId),
	});
	// React sets ANY in getQuestionsList, but leaves the learn endpoint's default unchanged.
	if (!learned) query.set('skillFilterMode', 'ANY');
	for (const key of ['title', 'titleOrDescription', 'skills', 'complexity', 'rate', 'order', 'orderBy'] as const) {
		if (input[key] !== undefined) query.set(key, input[key]);
	}
	if (learned) query.set('isLearned', String(input.status === 'learned'));
	else if (input.status === 'favorite') query.set('areFavorites', 'true');
	const result = await backendHttp<PersonalQuestionsRead>({
		config,
		path: `${learned ? `/interview-preparation/learn/${credentials.profileId}` : '/questions'}?${query}`,
		method: 'GET',
		effect: 'read',
		cache: 'no-store',
		timeoutMs: 5000,
		headers: { Authorization: `Bearer ${credentials.accessToken}` },
		decode: async (response) => {
			if (response.status === 401) return { status: 'unauthenticated' };
			if (response.status === 403) return { status: 'forbidden' };
			if (response.status !== 200) return { status: 'error' };
			const dto: unknown = await response.json();
			if (
				!object(dto) || !Array.isArray(dto.data) || dto.data.length > 10 ||
				!Number.isSafeInteger(dto.total) || (dto.total as number) < 0 ||
				(dto.page !== undefined && dto.page !== input.page && !(dto.total === 0 && dto.page === 1)) ||
				(dto.limit !== undefined && dto.limit !== 10)
			)
				return { status: 'error' };
			const data: QuestionListItem[] = [];
			for (const row of dto.data) {
				if (
					!object(row) || !Number.isSafeInteger(row.id) || (row.id as number) <= 0 ||
					data.some((item) => item.id === row.id) || typeof row.title !== 'string' ||
					typeof row.slug !== 'string' || !row.slug || /[/?#\\]/.test(row.slug) ||
					typeof row.shortAnswer !== 'string' || !Number.isFinite(row.rate) ||
					!Number.isFinite(row.complexity) ||
					(row.imageSrc !== undefined && row.imageSrc !== null && typeof row.imageSrc !== 'string') ||
					(row.profileId !== undefined && row.profileId !== credentials.profileId) ||
					(row.checksCount !== undefined && (!Number.isSafeInteger(row.checksCount) || (row.checksCount as number) < 0)) ||
					(row.isLearned !== undefined && typeof row.isLearned !== 'boolean') ||
					(row.isFavorite !== undefined && typeof row.isFavorite !== 'boolean') ||
					((row.checksCount === undefined) !== (row.isLearned === undefined))
				)
					return { status: 'error' };
				data.push({
					id: row.id as number, title: row.title, slug: row.slug, shortAnswer: row.shortAnswer,
					rate: row.rate as number, complexity: row.complexity as number,
					imageSrc: row.imageSrc as string | null | undefined,
					// Both absent means no profile-question record, not a failed private read.
					checksCount: (row.checksCount as number | undefined) ?? 0,
					isLearned: (row.isLearned as boolean | undefined) ?? false,
					// The backend enriches only IDs found in the profile's favorites.
					isFavorite: (row.isFavorite as boolean | undefined) ?? false,
				});
			}
			if (data.length > (dto.total as number)) return { status: 'error' };
			return { status: 'success', list: { data, total: dto.total as number, page: input.page, limit: 10 } };
		},
	});
	return result.status === 'response' ? result.value : { status: 'error' };
};
