'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';
import { useController, useFormContext } from 'react-hook-form';

import { i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { SelectWithChips } from '@/shared/ui/SelectWithChips';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Text } from '@/shared/ui/Text';

import {
	addSkillId,
	getAvailableSkills,
	getInitialSkillIds,
	isSkillId,
	mergeSkillMetadata,
	removeSkillId,
	sameSkillMetadata,
} from '../lib/skillsModel';
import type { SkillOption } from '../lib/skillsModel';
import styles from './EditSkills.module.css';

export type EditSkillsProps = {
	initialSkills: readonly SkillOption[];
	options: readonly SkillOption[];
	loading?: boolean;
	error?: boolean;
	disabled?: boolean;
};

export const EditSkills = ({
	initialSkills,
	options,
	loading = false,
	error = false,
	disabled = false,
}: EditSkillsProps) => {
	const t = useTranslations(i18Namespace.profile);
	const { control, getValues } = useFormContext<{ profileSkills: number[] }>();
	const { field, fieldState } = useController({
		name: 'profileSkills',
		control,
		defaultValue: getInitialSkillIds(initialSkills),
	});
	// Cache metadata only; selected IDs always come from the shared RHF context.
	const [seen, setSeen] = useState(() => mergeSkillMetadata(options, initialSkills));
	const ids = field.value ?? [];
	const metadata = mergeSkillMetadata(Object.values(seen), options, initialSkills);
	// Retain titles for selected options removed from subsequent catalogue snapshots.
	if (!sameSkillMetadata(seen, metadata)) setSeen(metadata);
	const dictionary = { ...metadata };
	for (const id of ids)
		if (!dictionary[id])
			dictionary[id] = { id, title: t('edit.skills.unavailable'), imageSrc: null };
	const available = getAvailableSkills(options, ids);
	const blocked = disabled || loading || error;
	const choose = (value?: string) => {
		if (blocked || value === undefined) return;
		const id = Number(value);
		if (!isSkillId(id) || ids.includes(id) || !available.some((option) => option.value === value))
			return;
		field.onChange(addSkillId(getValues('profileSkills') ?? [], id));
		field.onBlur();
	};
	const remove = (id: number) => () => {
		if (blocked) return;
		field.onChange(removeSkillId(getValues('profileSkills') ?? [], id));
		field.onBlur();
	};
	return (
		<Flex gap="20" className={styles.container}>
			<div className={styles.section}>
				<Flex direction="column" gap="8" className={styles.titles}>
					<Text variant="body4" color="black-800">
						{t('edit.skills.title')}
					</Text>
					<Text variant="body2" color="black-800">
						{t('edit.skills.description')}
					</Text>
				</Flex>
				<Flex
					direction="column"
					gap="8"
					className={styles.control}
					role="group"
					aria-label={t('skills.title')}
					aria-busy={loading}
				>
					<Text variant="body2" color="black-700">
						{t('skills.title')}
					</Text>
					{loading ? (
						<div role="status" aria-label={t('edit.skills.loading')}>
							<Skeleton className={styles.skeleton} borderRadius={8} />
						</div>
					) : (
						<SelectWithChips
							options={error ? [] : available}
							title={t('edit.skills.selected')}
							placeholder={available.length ? t('edit.skills.choose') : t('edit.skills.empty')}
							selectedItems={[...new Set(ids)]}
							itemsDictionary={dictionary}
							onChange={choose}
							handleDeleteItem={remove}
							disabled={blocked}
						/>
					)}
					{error && (
						<div role="alert">
							<Text variant="body2" color="red-700">
								{t('edit.skills.error')}
							</Text>
						</div>
					)}
					{fieldState.error?.message && (
						<div role="alert">
							<Text variant="body1" color="red-700">
								{fieldState.error.message}
							</Text>
						</div>
					)}
				</Flex>
			</div>
		</Flex>
	);
};
