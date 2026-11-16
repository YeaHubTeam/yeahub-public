import { useEffect, useRef, useState } from 'react';

import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import type {
	ProfileDeletionResult,
	SettingsProfileCreationResult,
	SettingsProfileSelectionResult,
} from '@/entities/profile';
import multyProfile from '@/shared/assets/images/multyProfile.png';
import { ROUTES, i18Namespace, useRouter } from '@/shared/config';
import { Banner } from '@/shared/ui/Banner';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { Text } from '@/shared/ui/Text';

import styles from './AccountProfiles.module.css';
import { DeleteAccountSection } from './DeleteAccountSection';
import type { AccountDeletionAction, AccountDeletionState } from './DeleteAccountSection';

export type AccountProfilesData = {
	hasPremiumAccess: boolean;
	username?: string | null;
	profiles: readonly {
		id: string;
		specializationId: number;
		isActive: boolean;
		specializationTitle: string | null;
	}[];
};
export type ProfileManagementActions = {
	select: (profileId: string) => Promise<SettingsProfileSelectionResult>;
	create: () => Promise<SettingsProfileCreationResult>;
	delete?: (profileId: string, confirmationUsername: string) => Promise<ProfileDeletionResult>;
};
type ProfileMessage =
	| 'pending'
	| 'success'
	| 'limit-reached'
	| 'unfinished-profile-exists'
	| 'navigation-unavailable'
	| 'unauthenticated'
	| 'refresh-required'
	| 'forbidden'
	| 'incomplete'
	| 'outcome-unknown'
	| 'invalid-input'
	| 'confirmation-mismatch'
	| 'last-profile'
	| 'active-profile'
	| 'deleted'
	| 'refresh-pending'
	| 'error';
export const useProfileManagement = (
	data?: AccountProfilesData,
	actions?: ProfileManagementActions,
	deleteAccountAction?: AccountDeletionAction,
) => {
	const router = useRouter();
	const [state, setState] = useState<{
		pending: boolean;
		blocked: boolean;
		success: boolean;
		message: ProfileMessage | null;
	}>({ pending: false, blocked: false, success: false, message: null });
	const [deletion, setDeletion] = useState<{ id: string; confirmation: string } | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [readback, setReadback] = useState<{
		source: AccountProfilesData;
		id: string;
		remaining: AccountProfilesData['profiles'];
	} | null>(null);
	const refreshed = readback !== null && data !== readback.source;
	const verified =
		refreshed &&
		!!data &&
		data.profiles.length === readback.remaining.length &&
		data.profiles.length > 0 &&
		!data.profiles.some((profile) => profile.id === readback.id) &&
		data.profiles.filter((profile) => profile.isActive).length === 1 &&
		readback.remaining.every((profile) =>
			data.profiles.some(
				(current) =>
					current.id === profile.id &&
					current.isActive === profile.isActive &&
					current.specializationId === profile.specializationId,
			),
		);
	const refreshFailed = refreshed && !verified;
	const effectivePending = state.pending && !refreshed;
	const alive = useRef(false);
	// One synchronous gate authorizes every profile/account mutation and sign-out retry.
	const operation = useRef<
		'idle' | 'busy' | 'stopped' | 'account-deleted' | 'signing-out' | 'signed-out'
	>('idle');
	const [accountDeletion, setAccountDeletion] = useState<AccountDeletionState>({
		open: false,
		confirmation: '',
		phase: 'idle',
		message: null,
	});
	useEffect(() => {
		alive.current = true;
		return () => {
			alive.current = false;
		};
	}, []);
	useEffect(() => {
		if (readback && (operation.current === 'stopped' || operation.current === 'idle'))
			operation.current = verified ? 'idle' : 'stopped';
	}, [readback, verified]);
	const openDelete = (id: string) => {
		if (
			operation.current !== 'idle' ||
			!actions?.delete ||
			!data ||
			data.profiles.length <= 1 ||
			!data.profiles.some((profile) => profile.id === id && !profile.isActive)
		)
			return;
		setDeletion({ id, confirmation: '' });
		setReadback(null);
		setDeleteOpen(true);
		setState({ pending: false, blocked: false, success: false, message: null });
	};
	const closeDelete = () => {
		if (operation.current === 'busy') return;
		setDeleteOpen(false);
		if (!state.blocked) setDeletion(null);
	};
	const confirmDelete = async () => {
		if (
			operation.current !== 'idle' ||
			!actions?.delete ||
			!data ||
			!deletion ||
			!deleteOpen ||
			!data.username ||
			deletion.confirmation !== data.username ||
			data.profiles.length <= 1 ||
			!data.profiles.some((profile) => profile.id === deletion.id && !profile.isActive)
		)
			return;
		operation.current = 'busy';
		setReadback(null);
		setState({ pending: true, blocked: false, success: false, message: 'pending' });
		try {
			const result = await actions.delete(deletion.id, deletion.confirmation);
			if (!alive.current) return;
			if (result.status === 'success') {
				operation.current = 'stopped';
				setReadback({
					source: data,
					id: deletion.id,
					remaining: data.profiles.filter((profile) => profile.id !== deletion.id),
				});
				setDeleteOpen(false);
				setState({ pending: true, blocked: false, success: false, message: 'refresh-pending' });
				router.refresh();
				return;
			}
			const blocked = result.status === 'incomplete' || result.status === 'outcome-unknown';
			if (blocked) operation.current = 'stopped';
			setState({ pending: false, blocked, success: false, message: result.status });
		} catch {
			if (alive.current) {
				operation.current = 'stopped';
				setReadback(null);
				setState({ pending: false, blocked: true, success: false, message: 'outcome-unknown' });
				setDeleteOpen(true);
			}
		} finally {
			if (operation.current === 'busy') operation.current = 'idle';
		}
	};
	const run = async (kind: 'select' | 'create', id?: string) => {
		if (operation.current !== 'idle' || !actions || !data) return;
		if (kind === 'select' && !data.profiles.some((profile) => profile.id === id)) return;
		if (kind === 'create') {
			const message = data.profiles.some((profile) => profile.specializationId === 0)
				? 'unfinished-profile-exists'
				: data.profiles.length >= (data.hasPremiumAccess ? 10 : 3)
					? 'limit-reached'
					: null;
			if (message) {
				setState({ ...state, message });
				return;
			}
		}
		operation.current = 'busy';
		setReadback(null);
		setState({ pending: true, blocked: false, success: false, message: 'pending' });
		try {
			const result = kind === 'create' ? await actions.create() : await actions.select(id!);
			if (!alive.current) return;
			if (result.status === 'success') {
				operation.current = 'stopped';
				setState({ pending: false, blocked: false, success: true, message: 'success' });
				router.push(result.href);
				return;
			}
			const blocked = result.status === 'incomplete' || result.status === 'outcome-unknown';
			if (blocked) operation.current = 'stopped';
			const message: ProfileMessage = result.status === 'not-found' ? 'error' : result.status;
			setState({ pending: false, blocked, success: false, message });
		} catch {
			if (alive.current) {
				operation.current = 'stopped';
				setState({ pending: false, blocked: true, success: false, message: 'outcome-unknown' });
			}
		} finally {
			if (operation.current === 'busy') operation.current = 'idle';
		}
	};

	const finishSignOut = async () => {
		if (operation.current !== 'account-deleted') return;
		operation.current = 'signing-out';
		setAccountDeletion((current) => ({
			...current,
			phase: 'signing-out',
			message: 'signout-pending',
		}));
		try {
			const result = await signOut({ redirect: false });
			if (!alive.current) return;
			if (
				!result ||
				typeof result.url !== 'string' ||
				!result.url ||
				('error' in result && result.error)
			)
				throw new Error('Sign-out not confirmed');
			operation.current = 'signed-out';
			setAccountDeletion((current) => ({ ...current, phase: 'signed-out', message: 'success' }));
			router.replace(ROUTES.auth.register.page);
		} catch {
			if (alive.current) {
				operation.current = 'account-deleted';
				setAccountDeletion((current) => ({
					...current,
					phase: 'signout-error',
					message: 'signout-error',
				}));
			}
		}
	};
	const openAccountDeletion = () => {
		if (operation.current !== 'idle' || !deleteAccountAction || !data) return;
		setDeleteOpen(false);
		setDeletion(null);
		setReadback(null);
		setAccountDeletion({ open: true, confirmation: '', phase: 'idle', message: null });
	};
	const closeAccountDeletion = () => {
		if (operation.current === 'busy' || operation.current === 'signing-out') return;
		setAccountDeletion((current) => ({
			...current,
			open: false,
			confirmation: operation.current === 'stopped' ? current.confirmation : '',
			message: operation.current === 'stopped' ? current.message : null,
		}));
	};
	const confirmAccountDeletion = async () => {
		if (
			operation.current !== 'idle' ||
			!deleteAccountAction ||
			!data?.username ||
			!accountDeletion.open ||
			accountDeletion.confirmation !== data.username
		)
			return;
		operation.current = 'busy';
		setReadback(null);
		setState({ pending: true, blocked: false, success: false, message: null });
		setAccountDeletion((current) => ({ ...current, phase: 'deleting', message: 'pending' }));
		try {
			const result = await deleteAccountAction(accountDeletion.confirmation);
			if (!alive.current) return;
			if (result.status === 'success') {
				// This terminal gate is set before sign-out; no later path may repeat DELETE.
				operation.current = 'account-deleted';
				setState({ pending: false, blocked: true, success: false, message: null });
				setAccountDeletion((current) => ({
					...current,
					open: false,
					phase: 'deleted',
					message: null,
				}));
				await finishSignOut();
				return;
			}
			const blocked = result.status === 'outcome-unknown';
			operation.current = blocked ? 'stopped' : 'idle';
			setState({ pending: false, blocked, success: false, message: null });
			setAccountDeletion((current) => ({ ...current, phase: 'idle', message: result.status }));
		} catch {
			if (alive.current) {
				operation.current = 'stopped';
				setState({ pending: false, blocked: true, success: false, message: null });
				setAccountDeletion((current) => ({
					...current,
					phase: 'idle',
					message: 'outcome-unknown',
				}));
			}
		} finally {
			if (operation.current === 'busy') operation.current = 'idle';
		}
	};
	return {
		...state,
		accountDeletion: deleteAccountAction
			? {
					...accountDeletion,
					disabled: effectivePending || state.blocked || state.success || refreshFailed,
					openDialog: openAccountDeletion,
					closeDialog: closeAccountDeletion,
					setConfirmation: (confirmation: string) => {
						if (operation.current === 'idle')
							setAccountDeletion((current) => ({ ...current, confirmation }));
					},
					confirm: () => {
						void confirmAccountDeletion();
					},
					retrySignOut: () => {
						void finishSignOut();
					},
				}
			: undefined,
		pending: effectivePending,
		blocked: state.blocked || refreshFailed,
		message: readback
			? verified
				? 'deleted'
				: refreshFailed
					? 'incomplete'
					: 'refresh-pending'
			: state.message,
		deletion,
		deleteOpen,
		canDelete: !!actions?.delete,
		openDelete,
		closeDelete,
		setConfirmation: (confirmation: string) => {
			if (operation.current !== 'busy')
				setDeletion((current) => (current ? { ...current, confirmation } : null));
		},
		confirmDelete: () => {
			void confirmDelete();
		},
		enabled: !!actions,
		select: (id: string) => {
			void run('select', id);
		},
		create: () => {
			void run('create');
		},
	};
};
export type ProfileManagementController = ReturnType<typeof useProfileManagement>;
export const AccountProfiles = ({
	hasPremiumAccess,
	username,
	profiles,
	controller,
}: AccountProfilesData & { controller?: ProfileManagementController }) => {
	const t = useTranslations(i18Namespace.profile);
	const [helpOpen, setHelpOpen] = useState(false);

	const disabled = controller?.pending || controller?.blocked || controller?.success;
	const createBlocked =
		profiles.length >= (hasPremiumAccess ? 10 : 3) ||
		profiles.some((profile) => profile.specializationId === 0);
	return (
		<Flex direction="column" gap="32">
			<Banner
				img={multyProfile}
				alt="MultyProfile"
				description={t('manage.profiles.multiprofile.banner.description')}
				color="white"
				className={styles.banner}
			/>
			<Card>
				<div className={styles.header}>
					<Text variant="head3" className={styles.heading}>
						{t('manage.profiles.title')}
					</Text>
					<span className={styles.counter} aria-label={t('manage.profiles.counter')}>
						<Text variant="body5-accent" color="white-900">
							{profiles.length}/{hasPremiumAccess ? 10 : 3}
						</Text>
					</span>
				</div>
				<ul
					className={styles.list}
					aria-label={t('manage.profiles.title')}
					aria-busy={controller?.pending ?? false}
				>
					{profiles.map((profile) => {
						const title =
							profile.specializationId === 0
								? t('manage.profiles.specializationEmpty')
								: (profile.specializationTitle ?? t('manage.profiles.specializationError'));
						return (
							<li
								key={profile.id}
								title={profile.specializationTitle ?? undefined}
								className={`${styles.profile} ${profile.isActive ? styles.active : ''}`}
							>
								{controller?.enabled && (
									<button
										type="button"
										className={styles.select}
										aria-label={t('manage.profiles.select', { specialization: title })}
										aria-current={profile.isActive ? 'true' : undefined}
										disabled={disabled}
										onClick={() => controller.select(profile.id)}
									/>
								)}
								<span className={styles.portrait} aria-hidden="true">
									<Icon icon="user" size={38} />
									{profile.isActive && (
										<Icon icon="checkCircle" size={18} className={styles.check} />
									)}
								</span>
								<Text variant="body3-accent" className={styles.title}>
									{title}
								</Text>
								{profile.isActive && (
									<span className={styles['screen-reader']}>{t('manage.profiles.active')}</span>
								)}
								{!profile.isActive && profiles.length > 1 && controller?.canDelete && (
									<button
										type="button"
										disabled={disabled}
										className={styles['delete-action']}
										aria-label={t('manage.profiles.deleteLabel', { specialization: title })}
										onClick={() => controller.openDelete(profile.id)}
									>
										<Icon icon="trash" size={20} aria-hidden="true" />
										{t('manage.profiles.delete')}
									</button>
								)}
								{profile.isActive && controller?.enabled && (
									<button
										type="button"
										disabled={disabled}
										className={styles.open}
										onClick={() => controller.select(profile.id)}
									>
										{t('manage.profiles.open')}
										<Icon icon="arrowRight" size={24} />
									</button>
								)}
							</li>
						);
					})}
				</ul>

				<div className={styles.actions}>
					<button
						type="button"
						className={styles.help}
						onClick={() => setHelpOpen(true)}
						aria-haspopup="dialog"
					>
						<Icon icon="lamp" size={24} aria-hidden="true" />
						{t('manage.profiles.modal.how.switch.specialization.button')}
					</button>
					{controller?.enabled && (
						<Button
							type="button"
							disabled={disabled || createBlocked}
							onClick={controller.create}
							suffix={<Icon icon="plus" size={24} />}
						>
							{t('manage.profiles.add')}
						</Button>
					)}
				</div>
				<Modal
					isOpen={helpOpen}
					onClose={() => setHelpOpen(false)}
					title={t('manage.profiles.modal.how.switch.specialization.title')}
					className={styles['help-modal']}
					contentClassName={styles['help-content']}
				>
					<ol className={styles.steps}>
						{(['0', '1', '2', '3'] as const).map((index) => (
							<li key={index} className={styles.step}>
								<Text variant="body3-accent" className={styles['step-text']}>
									{t(`manage.profiles.modal.how.switch.specialization.content.${index}`)}
								</Text>
							</li>
						))}
					</ol>
					<Text variant="body3-accent" color="purple-700" className={styles['help-description']}>
						{t('manage.profiles.modal.how.switch.specialization.description')}
					</Text>
				</Modal>

				<Modal
					isOpen={controller?.deleteOpen ?? false}
					onClose={() => controller?.closeDelete()}
					variant="error"
					className={styles['delete-modal']}
					title={t('manage.profiles.modal.delete.profile.title')}
					withCloseIcon={!controller?.pending}
					buttonPrimaryText={t('manage.profiles.modal.delete.profile.button')}
					buttonOutlineText={t('manage.profiles.cancel')}
					buttonPrimaryDisabled={
						!username || controller?.deletion?.confirmation !== username || disabled
					}
					buttonOutlineDisabled={controller?.pending}
					buttonPrimaryClick={() => controller?.confirmDelete()}
					buttonOutlineClick={() => controller?.closeDelete()}
				>
					<Text variant="body3-accent" className={styles['delete-description']}>
						{t('manage.profiles.modal.delete.profile.description')}
					</Text>
					<label htmlFor="delete-profile-username">
						<Text variant="body2" className={styles['delete-label']}>
							{t('manage.profiles.modal.delete.profile.label')}
						</Text>
					</label>
					<Input
						id="delete-profile-username"
						className={styles['delete-input']}
						value={controller?.deletion?.confirmation ?? ''}
						disabled={controller?.pending}
						placeholder={t('manage.profiles.modal.delete.profile.placeholder')}
						onChange={(event) => controller?.setConfirmation(event.target.value)}
					/>
					{!username && (
						<Text variant="body3" color="red-700">
							{t('manage.profiles.usernameUnavailable')}
						</Text>
					)}
					{controller?.message && (
						<div role={controller.pending ? 'status' : 'alert'}>
							<Text variant="body3" color={controller.pending ? 'black-800' : 'red-700'}>
								{t(`manage.profiles.feedback.${controller.message}`)}
							</Text>
						</div>
					)}
				</Modal>

				{controller?.message && !controller.deleteOpen && (
					<div
						role={
							controller.pending || controller.success || controller.message === 'deleted'
								? 'status'
								: 'alert'
						}
						className={styles.feedback}
					>
						<Text
							variant="body3"
							color={
								controller.pending || controller.success || controller.message === 'deleted'
									? 'black-800'
									: 'red-700'
							}
						>
							{t(`manage.profiles.feedback.${controller.message}`)}
						</Text>
					</div>
				)}
			</Card>
			{controller?.accountDeletion && (
				<DeleteAccountSection username={username ?? null} controller={controller.accountDeletion} />
			)}
		</Flex>
	);
};
