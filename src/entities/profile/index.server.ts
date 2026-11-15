import 'server-only';

export type {
	ProfileDeletionResult,
	SettingsProfileCreationResult,
	SettingsProfileSelectionResult,
} from './model/types/profileManagement';
export type { TelegramMutationResult } from './model/types/telegram';
export type { VerificationEmailResult } from './api/verificationEmail.server';
export type { AccountDeletionResult } from './api/accountDeletion.server';

export { readOwnProfile } from './api/profile.server';
export { readHeaderProfile } from './api/headerProfile.server';
export { readSettingsSnapshot } from './api/settings.server';
export type { HeaderProfileResult } from './model/types/profile';
export type { SettingsSnapshotResult } from './model/types/settings';

export { sendVerificationEmail } from './api/verificationEmail.server';
export { mutateTelegram, parseTelegramPayload } from './api/telegram.server';
export {
	selectOwnProfile,
	createOwnProfile,
	deleteOwnProfile,
} from './api/profileManagement.server';
export { deleteOwnAccount } from './api/accountDeletion.server';
export type {
	ProfileCreationResult,
	ProfileSelectionResult,
} from './model/types/profileManagement';

export { parseProfileEditInput, saveOwnProfile } from './api/profileEdit.server';
export type { ProfileEditResult } from './model/types/profileEdit';
