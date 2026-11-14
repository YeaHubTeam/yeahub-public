import 'server-only';

export { readOwnProfile } from './api/profile.server';
export type { OwnProfile, OwnProfileResult } from './model/types/profile';
export { parseProfileEditInput, saveOwnProfile } from './api/profileEdit.server';
export type { ProfileEditInput, ProfileEditResult } from './model/types/profileEdit';

export { readHeaderProfile } from './api/headerProfile.server';
export type { HeaderProfileResult } from './model/types/profile';

export { readSettingsSnapshot } from './api/settings.server';
export type { SettingsSnapshot, SettingsSnapshotResult } from './model/types/settings';

export { sendVerificationEmail } from './api/verificationEmail.server';
export type { VerificationEmailResult } from './api/verificationEmail.server';

export { mutateTelegram, parseTelegramPayload } from './api/telegram.server';
export type { TelegramLoginPayload, TelegramMutationResult } from './model/types/telegram';

export {
	deleteOwnProfile,
	createOwnProfile,
	selectOwnProfile,
} from './api/profileManagement.server';
export type {
	ProfileDeletionResult,
	ProfileCreationResult,
	SettingsProfileCreationResult,
	ProfileSelectionResult,
	SettingsProfileSelectionResult,
} from './model/types/profileManagement';

export { deleteOwnAccount } from './api/accountDeletion.server';
export type { AccountDeletionResult } from './api/accountDeletion.server';
