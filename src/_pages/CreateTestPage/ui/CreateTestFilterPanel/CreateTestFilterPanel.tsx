'use client';

import { useTranslations } from 'next-intl';

import { GetSkillsListResponse } from '@/entities/skill';
import { InterviewQuizCreate, TestCreate, i18Namespace } from '@/shared/config';
import { BaseFilterSection } from '@/shared/ui/BaseFilterSection';
import { Counter } from '@/shared/ui/Counter';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { useCreateTestFilter } from '../../api/useCreateTestFilter';
import type { TestSelectionMode } from '../../model/types/filters';
import { CreateTestButton } from '../CreateTestButton/CreateTestButton';
import styles from './CreateTestFilterPanel.module.css';

interface CreateTestFilterPanelProps {
	initialSkills?: GetSkillsListResponse | null;
}

const complexityRanges = [
	{ id: 1, title: '1–3', value: [1, 2, 3] },
	{ id: 2, title: '4–6', value: [4, 5, 6] },
	{ id: 3, title: '7–8', value: [7, 8] },
	{ id: 4, title: '9–10', value: [9, 10] },
];

export const CreateTestFilterPanel = ({ initialSkills }: CreateTestFilterPanelProps) => {
	const t = useTranslations(i18Namespace.testCreate);
	const tQuiz = useTranslations(i18Namespace.interviewQuizCreate);
	const { filter, handlers } = useCreateTestFilter();

	const onChooseSkill = (id: number) => {
		const skills = filter.skills ?? [];
		handlers.onChangeSkills(
			skills.includes(id) ? skills.filter((skill) => skill !== id) : [...skills, id],
		);
	};
	const onChooseComplexity = (id: number) => {
		const values = complexityRanges.find((range) => range.id === id)?.value ?? [];
		const selected = filter.complexity ?? [];
		const active = selected.some((value) => values.includes(value));
		handlers.onChangeComplexity(
			active ? selected.filter((value) => !values.includes(value)) : [...selected, ...values],
		);
	};

	const modes: { id: TestSelectionMode; title: string; active: boolean }[] = [
		{
			id: 'REPEAT',
			title: tQuiz(InterviewQuizCreate.MODE_REPEAT),
			active: filter.mode === 'REPEAT',
		},
		{ id: 'NEW', title: tQuiz(InterviewQuizCreate.MODE_NEW), active: filter.mode === 'NEW' },
		{
			id: 'RANDOM',
			title: tQuiz(InterviewQuizCreate.MODE_RANDOM),
			active: filter.mode === 'RANDOM',
		},
	];

	return (
		<>
			<Flex justify="between" className={styles.wrapper}>
				<div className={styles['skills-selection']}>
					<BaseFilterSection
						title={t(TestCreate.SKILLS)}
						data={(initialSkills?.data ?? []).map(({ id, title, imageSrc }) => ({
							id,
							title,
							imageSrc,
							active: filter.skills?.includes(id),
						}))}
						onClick={onChooseSkill}
					/>
				</div>
				<Flex direction="column" gap="24" className={styles['additional-wrapper']}>
					<BaseFilterSection
						title={t(TestCreate.COMPLEXITY)}
						data={complexityRanges.map((range) => ({
							...range,
							active: filter.complexity?.some((value) => range.value.includes(value)),
						}))}
						onClick={onChooseComplexity}
					/>
					<BaseFilterSection
						title={t(TestCreate.MODE)}
						data={modes}
						onClick={handlers.onChangeMode}
					/>
					<Flex direction="column" gap="8">
						<Text variant="body2" color="black-700">
							{t(TestCreate.COUNT)}
						</Text>
						<Counter count={filter.limit ?? 20} onChange={handlers.onChangeLimit} />
					</Flex>
				</Flex>
			</Flex>
			<CreateTestButton filter={filter} />
		</>
	);
};
