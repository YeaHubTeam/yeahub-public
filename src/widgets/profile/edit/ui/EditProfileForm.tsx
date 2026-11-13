'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { KeyboardEvent } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import type { OwnProfile, ProfileEditInput, ProfileEditResult } from '@/entities/profile';
import { AvatarEditor } from '@/features/profile/avatar';
import type { AvatarAction } from '@/features/profile/avatar';
import { EditAbout } from '@/features/profile/editAbout';
import { EditPersonal } from '@/features/profile/editPersonal';
import { EditSkills } from '@/features/profile/editSkills';
import type { SkillOption } from '@/features/profile/editSkills';
import { Link, ROUTES, i18Namespace, useRouter } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import {
	createEditDefaults,
	matchesSavedProfile,
	sameEditValues,
	savedToEditValues,
	toEditPayload,
} from '../lib/editProfileMapper';
import type { EditProfileValues, SavedProfileSnapshot } from '../lib/editProfileMapper';
import { createEditProfileSchema } from '../lib/editProfileSchema';
import styles from './EditProfileForm.module.css';

export type EditProfileFormProps = {
	profile: OwnProfile;
	specialization: { id: number; title: string } | null;
	skills: readonly SkillOption[];
	skillsError?: boolean;
	avatarAction: AvatarAction;
	saveAction: (input: ProfileEditInput) => Promise<ProfileEditResult>;
	readAction: () => Promise<
		| { status: 'success'; profile: SavedProfileSnapshot }
		| { status: 'unauthorized' | 'refresh-required' | 'error' }
	>;
};
const tabs = ['personal-information', 'about-me', 'skills'] as const;
type Tab = (typeof tabs)[number];
const currentTab = (): Tab => tabs.find((tab) => window.location.hash === `#${tab}`) ?? tabs[0];
const hashListeners = new Set<() => void>();
const subscribeHash = (listener: () => void) => {
	hashListeners.add(listener);
	window.addEventListener('hashchange', listener);
	return () => {
		hashListeners.delete(listener);
		window.removeEventListener('hashchange', listener);
	};
};
const subscribeMount = () => () => {};
export const EditProfileForm = ({
	profile,
	specialization,
	skills,
	skillsError = false,
	avatarAction,
	saveAction,
	readAction,
}: EditProfileFormProps) => {
	const t = useTranslations(i18Namespace.profile);
	const common = useTranslations(i18Namespace.translation);
	const router = useRouter();
	const [baseline, setBaseline] = useState(() => ({
		values: createEditDefaults(profile),
		description: profile.activeProfile.description,
	}));
	const identity = useRef({ id: profile.id, profileId: profile.activeProfile.id });
	const schema = useMemo(
		() =>
			createEditProfileSchema(
				{
					personal: {
						required: common('validation.required'),
						minUsernameLength: common('validation.length.min', { count: 2 }),
						maxUsernameLength: common('validation.length.max', { count: 30 }),
						socialNetwork: t('edit.validation.socialNetwork'),
					},
					about: {
						links: t('edit.about.validation.links'),
						maxBytes: t('edit.about.validation.maxBytes', { count: 65_536 }),
						invalid: t('edit.about.validation.invalid'),
					},
					skills: {
						required: common('validation.required'),
						invalid: t('edit.skills.validation.invalid'),
						duplicate: t('edit.skills.validation.duplicate'),
					},
				},
				baseline.description,
			),
		[baseline.description, t, common],
	);
	const methods = useForm<EditProfileValues>({
		defaultValues: baseline.values,
		mode: 'onTouched',
		resolver: yupResolver(schema),
	});
	const watched = useWatch({ control: methods.control });
	const dirty = !sameEditValues(watched as EditProfileValues, baseline.values);
	const tab = useSyncExternalStore(subscribeHash, currentTab, () => tabs[0]);
	const [pending, setPending] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const mounted = useSyncExternalStore(
		subscribeMount,
		() => true,
		() => false,
	);
	const alive = useRef(false);
	const locked = useRef(false);
	const leave = useRef(false);
	const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
	useEffect(() => {
		alive.current = true;
		return () => {
			alive.current = false;
		};
	}, []);
	useEffect(() => {
		if (!dirty) return;
		leave.current = false;
		const warn = (event: BeforeUnloadEvent) => {
			if (leave.current) return;
			event.preventDefault();
			event.returnValue = '';
		};
		window.addEventListener('beforeunload', warn);
		return () => window.removeEventListener('beforeunload', warn);
	}, [dirty]);
	const select = (next: Tab) => {
		// Use the public History integration; Next.js retains its own router state.
		window.history.replaceState(
			null,
			'',
			`${window.location.pathname}${window.location.search}#${next}`,
		);
		hashListeners.forEach((listener) => listener());
	};
	const keyboard = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
		const next =
			event.key === 'ArrowRight'
				? (index + 1) % 3
				: event.key === 'ArrowLeft'
					? (index + 2) % 3
					: event.key === 'Home'
						? 0
						: event.key === 'End'
							? 2
							: null;
		if (next === null) return;
		event.preventDefault();
		select(tabs[next]);
		tabButtons.current[next]?.focus();
	};
	const unauthorized = () => {
		leave.current = true;
		router.replace(ROUTES.auth.login.page);
	};
	const submit = async (values: EditProfileValues) => {
		const sent = toEditPayload(values, baseline.description);
		const expected = { ...identity.current, description: baseline.description };
		try {
			const result = await saveAction(sent);
			if (!alive.current) return;
			if (result.status === 'unauthorized') {
				unauthorized();
				return;
			}
			if (result.status !== 'success') {
				setMessage(
					t(
						result.status === 'partial-success'
							? 'edit.save.partial'
							: result.status === 'sync-required'
								? 'edit.save.sync'
								: result.status === 'validation-error'
									? 'edit.save.validation'
									: 'edit.save.error',
					),
				);
				return;
			}
			const read = await readAction();
			if (!alive.current) return;
			if (read.status === 'unauthorized') {
				unauthorized();
				return;
			}
			if (read.status !== 'success') {
				setMessage(
					t(read.status === 'refresh-required' ? 'edit.save.refresh' : 'edit.save.readError'),
				);
				return;
			}
			if (!matchesSavedProfile(read.profile, sent, expected)) {
				setMessage(t('edit.save.mismatch'));
				return;
			}
			const confirmed = savedToEditValues(read.profile);
			const unchanged = sameEditValues(methods.getValues(), values);
			setBaseline({ values: confirmed, description: read.profile.description });
			if (!unchanged) {
				methods.reset(confirmed, { keepValues: true });
				setMessage(t('edit.save.newerDraft'));
				return;
			}
			methods.reset(confirmed);
			leave.current = true;
			setSuccess(true);
			setMessage(t('edit.save.success'));
			router.replace(ROUTES.profile.page);
		} catch {
			if (alive.current) setMessage(t('edit.save.error'));
		}
	};
	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!mounted || locked.current || success) return;
		locked.current = true;
		setPending(true);
		setSuccess(false);
		setMessage(null);
		void methods
			.handleSubmit(submit, (errors) => {
				const next =
					errors.username || errors.city || errors.socialNetwork
						? 'personal-information'
						: errors.description
							? 'about-me'
							: 'skills';
				select(next);
				setMessage(t('edit.save.validation'));
			})(event)
			.catch(() => {
				if (alive.current) setMessage(t('edit.save.error'));
			})
			.finally(() => {
				locked.current = false;
				if (alive.current) setPending(false);
			});
	};
	const labels = [t('edit.tabs.personal'), t('edit.tabs.about'), t('edit.tabs.skills')];
	return (
		<>
			<nav aria-label={t('edit.title')}>
				<ol className={styles.breadcrumbs}>
					<li className={styles.crumb}>
						<Link href={ROUTES.profile.page} className={styles['crumb-link']}>
							<Icon
								icon="altArrowRight"
								size={20}
								color="black-700"
								className={styles['crumb-back']}
								aria-hidden="true"
							/>
							<Text variant="body3" color="black-700" className={styles['crumb-text']}>
								{t('edit.breadcrumb.profile')}
							</Text>
						</Link>
					</li>
					<li className={`${styles.crumb} ${styles['crumb-current']}`} aria-current="page">
						<Icon icon="altArrowRight" size={20} color="purple-700" aria-hidden="true" />
						<Text variant="body3" color="purple-700" className={styles['crumb-text']}>
							{t('edit.title')}
						</Text>
					</li>
				</ol>
			</nav>
			<Card>
				<Text variant="body5-strong" isMainTitle className={styles.title}>
					{t('edit.title')}
				</Text>
				<div className={styles.tabs}>
					<div role="tablist" aria-label={t('edit.title')} className={styles.list}>
						{tabs.map((id, index) => (
							<button
								key={id}
								id={`tab-${id}`}
								ref={(element) => {
									tabButtons.current[index] = element;
								}}
								type="button"
								role="tab"
								aria-selected={id === tab}
								aria-controls={`panel-${id}`}
								tabIndex={id === tab ? 0 : -1}
								className={styles.tab}
								onClick={() => select(id)}
								onKeyDown={(event) => keyboard(event, index)}
							>
								<Text variant="body4" color={id === tab ? 'purple-700' : 'black-500'}>
									{labels[index]}
								</Text>
							</button>
						))}
					</div>
				</div>
				<FormProvider {...methods}>
					<form
						onSubmit={handleSubmit}
						onKeyDown={(event) => {
							if (!mounted && event.key === 'Enter') event.preventDefault();
						}}
						noValidate
						aria-busy={pending}
					>
						<fieldset disabled={!mounted} className={styles.fields}>
							{tabs.map((id) => (
								<div
									key={id}
									id={`panel-${id}`}
									role="tabpanel"
									aria-labelledby={`tab-${id}`}
									hidden={id !== tab}
								>
									{id === tab && id === 'personal-information' && (
										<EditPersonal
											profile={profile}
											specialization={specialization}
											avatar={
												<AvatarEditor
													variant="profile-edit"
													image={profile.avatarUrl}
													avatarAction={avatarAction}
												/>
											}
										/>
									)}
									{id === tab && id === 'about-me' && <EditAbout />}
									{id === tab && id === 'skills' && (
										<EditSkills
											initialSkills={profile.activeProfile.profileSkills}
											options={skills}
											error={skillsError}
										/>
									)}
								</div>
							))}
						</fieldset>
						{message && (
							<div role={success ? 'status' : 'alert'} className={styles.message}>
								<Text variant="body3" color={success ? 'black-800' : 'red-700'}>
									{message}
								</Text>
							</div>
						)}
						<div className={styles.save}>
							<Button type="submit" disabled={!mounted || pending || success} aria-busy={pending}>
								{t('edit.save.button')}
							</Button>
						</div>
					</form>
				</FormProvider>
			</Card>
		</>
	);
};
