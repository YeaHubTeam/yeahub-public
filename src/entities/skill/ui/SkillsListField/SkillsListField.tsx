'use client';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import { Skills, Translation, i18Namespace } from '@/shared/config';
import { BaseFilterItem, BaseFilterSection } from '@/shared/ui/BaseFilterSection';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';

import { MAX_SHOW_LIMIT_SKILLS } from '../../model/constants/skillConstants';
import { useSkills } from '../../model/hooks/useSkills';
import { GetSkillsListResponse } from '../../model/types/skill';

interface SkillsListFieldProps {
	selectedSkills?: number[];
	onChangeSkills: (skills: number[] | undefined) => void;
	selectedSpecialization: number;
	showAllLabel?: boolean;
	initialData?: GetSkillsListResponse | null;
}

export const SkillsListField = ({
	selectedSkills,
	onChangeSkills,
	selectedSpecialization,
	initialData,
	showAllLabel = true,
}: SkillsListFieldProps) => {
	const t = useTranslations(i18Namespace.skill);
	const tCommon = useTranslations(i18Namespace.translation);

	const [showAll, setShowAll] = useState(false);
	const [limit, setLimit] = useState(MAX_SHOW_LIMIT_SKILLS);
	const { data: skills } = useSkills(
		{ limit, specializations: selectedSpecialization },
		initialData,
	);

	const onToggleShowAll = () => {
		setShowAll(!showAll);
	};

	useEffect(() => {
		if (showAll) {
			setLimit(skills?.total ?? MAX_SHOW_LIMIT_SKILLS);
		} else {
			setLimit(MAX_SHOW_LIMIT_SKILLS);
		}
	}, [skills?.total, showAll]);

	const onChooseSkill = (id: number) => {
		if (selectedSkills?.includes(id)) {
			const filteredSkills = selectedSkills.filter((skill) => skill !== id);
			onChangeSkills(filteredSkills.length > 0 ? filteredSkills : undefined);
		} else {
			onChangeSkills([...(selectedSkills || []), id]);
		}
	};

	const skillsItems: BaseFilterItem<number>[] | undefined = skills?.data.map(
		({ id, title, imageSrc }) => ({
			id,
			title,
			imageSrc,
			active: selectedSkills?.includes(id),
		}),
	);

	if (!skillsItems) return null;

	return (
		<Flex direction="column" align="start" gap="8">
			<BaseFilterSection
				data={skillsItems}
				title={t(Skills.SELECT_CHOOSE)}
				onClick={onChooseSkill}
			/>

			{showAllLabel && (
				<Button variant="link" onClick={onToggleShowAll}>
					{!showAll ? tCommon(Translation.SHOW_ALL) : tCommon(Translation.HIDE)}
				</Button>
			)}
		</Flex>
	);
};
