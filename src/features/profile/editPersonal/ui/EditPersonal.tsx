'use client';

import type { KeyboardEvent, ReactNode } from 'react';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import type { OwnProfile } from '@/entities/profile';
import { i18Namespace } from '@/shared/config';
import { Dropdown } from '@/shared/ui/Dropdown';
import { Flex } from '@/shared/ui/Flex';
import { FormControl } from '@/shared/ui/FormControl';
import { Input } from '@/shared/ui/Input';
import { Text } from '@/shared/ui/Text';

import styles from './EditPersonal.module.css';

export const PERSONAL_SOCIAL_CODES = [
	'instagram',
	'linkedin',
	'twitter',
	'facebook',
	'github',
	'behance',
	'whatsapp',
	'telegram',
	'youtube',
] as const;
export type PersonalFormValues = {
	username: string;
	city: string;
	socialNetwork: { code: (typeof PERSONAL_SOCIAL_CODES)[number]; title: string }[];
};

// The parent supplies these values to the single, shared FormProvider once.
export const createPersonalDefaults = (profile: OwnProfile): PersonalFormValues => ({
	username: profile.username,
	city: profile.city ?? '',
	socialNetwork: PERSONAL_SOCIAL_CODES.map((code) => ({
		code,
		title: profile.activeProfile.socialNetwork.find((link) => link.code === code)?.title ?? '',
	})),
});

// Never forward read-only props or unknown social records. The server preserves unknown records.
export const toPersonalPayload = (values: PersonalFormValues): PersonalFormValues => ({
	username: values.username,
	city: values.city,
	socialNetwork: PERSONAL_SOCIAL_CODES.flatMap((code) => {
		const link = values.socialNetwork.find((item) => item.code === code);
		return link && link.title !== '' ? [{ code, title: link.title }] : [];
	}),
});

export type EditPersonalProps = {
	profile: OwnProfile;
	specialization: { id: number; title: string } | null;
	avatar: ReactNode;
};

const preventEnter = (event: KeyboardEvent<HTMLInputElement>) => {
	if (event.key === 'Enter') event.preventDefault();
};

export const EditPersonal = ({ profile, specialization, avatar }: EditPersonalProps) => {
	const t = useTranslations(i18Namespace.profile);
	const { control } = useFormContext<PersonalFormValues>();
	const heading = (title: string, description: string) => (
		<Flex direction="column" gap="8" className={styles.titles}>
			<Text variant="body4" color="black-800">
				{title}
			</Text>
			<Text variant="body2" color="black-800">
				{description}
			</Text>
		</Flex>
	);
	return (
		<Flex direction="column" className={styles.sections}>
			<div className={styles.section}>
				{heading(t('avatar.upload.preview'), t('edit.photo.description'))}
				{avatar}
			</div>
			<div className={styles.section}>
				{heading(t('edit.personal.title'), t('edit.personal.description'))}
				<Flex gap="20" direction="column" className={styles.controls}>
					<FormControl name="username" control={control} label={t('edit.form.username')}>
						{(field, error) => (
							<Input
								{...field}
								id="username"
								label={t('edit.form.username')}
								error={error}
								size="S"
								className={styles.input}
								onKeyDown={preventEnter}
							/>
						)}
					</FormControl>
					<Flex
						direction="column"
						gap="8"
						role="group"
						aria-label={t('edit.form.specialization')}
						aria-disabled="true"
					>
						<Text variant="body2" color="black-700">
							{t('edit.form.specialization')}
						</Text>
						<Dropdown
							size="S"
							disabled
							label={t('edit.form.specializationEmpty')}
							value={
								specialization?.title.trim()
									? specialization.title
									: t('edit.form.specializationEmpty')
							}
							className={styles.input}
						>
							{null}
						</Dropdown>
					</Flex>
					<label htmlFor="edit-personal-email">
						<Flex direction="column" gap="8">
							<Text variant="body2" color="black-700">
								{t('edit.form.email')}
							</Text>
							<Input
								id="edit-personal-email"
								label={t('edit.form.email')}
								size="S"
								value={profile.email}
								disabled
								readOnly
								className={styles.input}
							/>
						</Flex>
					</label>
					<FormControl name="city" control={control} label={t('edit.form.city')}>
						{(field, error) => (
							<Input
								{...field}
								id="city"
								label={t('edit.form.city')}
								error={error}
								size="S"
								className={styles.input}
								onKeyDown={preventEnter}
							/>
						)}
					</FormControl>
				</Flex>
			</div>
			<div className={styles.section}>
				{heading(t('edit.links.title'), t('edit.links.description'))}
				<Flex gap="20" maxWidth wrap="wrap" className={styles.socials}>
					{PERSONAL_SOCIAL_CODES.map((code, index) => (
						<FormControl
							key={code}
							name={`socialNetwork.${index}.title`}
							control={control}
							label={t(`edit.social.${code}`)}
						>
							{(field, error) => (
								<Input
									{...field}
									id={`socialNetwork.${index}.title`}
									label={t(`edit.social.${code}`)}
									error={error}
									size="S"
									className={styles.input}
								/>
							)}
						</FormControl>
					))}
				</Flex>
			</div>
		</Flex>
	);
};
