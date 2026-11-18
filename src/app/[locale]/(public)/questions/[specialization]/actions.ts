'use server';

import { getSettingsSnapshot } from '@/app/_bff/settings/index.server';
import type { QuestionsListScope } from '@/pages/QuestionsPage';

// Compare only list scope/capabilities. No questions, credentials or full snapshot in the client.
export async function readQuestionsListScope(): Promise<QuestionsListScope> {
	const result = await getSettingsSnapshot();
	if (result.status !== 'success') return { status: result.status };
	return {
		status: 'success' as const,
		userId: result.snapshot.userId,
		profileId: result.snapshot.activeProfileId,
		hasPremiumAccess: result.snapshot.hasPremiumAccess,
		isVerified: result.snapshot.isVerified,
	};
}
