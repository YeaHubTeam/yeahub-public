import { useTranslations } from 'next-intl';

import type { AccountDeletionResult } from '@/entities/profile/server';
import { i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { Text } from '@/shared/ui/Text';

import styles from './DeleteAccountSection.module.css';

export type AccountDeletionAction = (
	confirmationUsername: string,
) => Promise<AccountDeletionResult>;
export type AccountDeletionState = {
	open: boolean;
	confirmation: string;
	phase: 'idle' | 'deleting' | 'deleted' | 'signing-out' | 'signout-error' | 'signed-out';
	message: AccountDeletionResult['status'] | 'pending' | 'signout-pending' | 'signout-error' | null;
};
export type AccountDeletionController = AccountDeletionState & {
	disabled: boolean;
	openDialog: () => void;
	closeDialog: () => void;
	setConfirmation: (value: string) => void;
	confirm: () => void;
	retrySignOut: () => void;
};
export const DeleteAccountSection = ({
	username,
	controller,
}: {
	username: string | null;
	controller: AccountDeletionController;
}) => {
	const t = useTranslations(i18Namespace.user);
	const deleted = ['deleted', 'signing-out', 'signout-error', 'signed-out'].includes(
		controller.phase,
	);
	const pending = controller.phase === 'deleting';
	const feedback = controller.message && (
		<div
			role={
				pending || controller.phase === 'signing-out' || controller.phase === 'signed-out'
					? 'status'
					: 'alert'
			}
			className={styles.feedback}
		>
			<Text
				variant="body3"
				color={
					pending || controller.phase === 'signing-out' || controller.phase === 'signed-out'
						? 'black-800'
						: 'red-700'
				}
			>
				{t(`delete.feedback.${controller.message}`)}
			</Text>
		</div>
	);
	return (
		<Card>
			<Text variant="head3" className={styles.title}>
				{t('delete.title')}
			</Text>
			<Text variant="body3" className={styles.description}>
				{t('delete.description.main')}
			</Text>
			{deleted ? (
				<>
					{feedback}
					{controller.phase === 'signout-error' && (
						<Button type="button" onClick={controller.retrySignOut}>
							{t('delete.retrySignOut')}
						</Button>
					)}
				</>
			) : (
				<>
					<Button
						type="button"
						variant="destructive"
						size="large"
						className={styles.trigger}
						disabled={controller.disabled}
						onClick={controller.openDialog}
					>
						{t('delete.button')}
					</Button>
					{!controller.open && feedback}
					<Modal
						isOpen={controller.open}
						onClose={controller.closeDialog}
						variant="error"
						title={t('delete.title')}
						className={styles.modal}
						withCloseIcon={!pending}
						buttonPrimaryText={t('delete.button')}
						buttonOutlineText={t('delete.cancel')}
						buttonPrimaryClick={controller.confirm}
						buttonOutlineClick={controller.closeDialog}
						buttonPrimaryDisabled={
							controller.disabled || !username || controller.confirmation !== username
						}
						buttonOutlineDisabled={pending}
					>
						<Text variant="body3-accent" className={styles.warning}>
							{t('delete.description.modal')}
						</Text>
						<label htmlFor="delete-account-username">
							<Text variant="body2" className={styles.label}>
								{t('delete.label')}
							</Text>
						</label>
						<Input
							id="delete-account-username"
							value={controller.confirmation}
							onChange={(event) => controller.setConfirmation(event.target.value)}
							placeholder={t('delete.placeholder')}
							className={styles.input}
							disabled={pending || controller.disabled}
						/>
						{!username && (
							<Text variant="body3" color="red-700">
								{t('delete.usernameUnavailable')}
							</Text>
						)}
						{feedback}
					</Modal>
				</>
			)}
		</Card>
	);
};
