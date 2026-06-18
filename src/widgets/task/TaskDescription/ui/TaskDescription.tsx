import React from 'react';

import { useTranslations } from 'next-intl';

import { Company, CompanyCompactList } from '@/entities/company';
import { ProgrammingLanguage, ProgrammingLanguageList } from '@/entities/programmingLanguage';
import { TaskCategoryCode, TaskDifficulty, taskCategories } from '@/entities/tasks';
import { TaskDifficultyChip } from '@/entities/tasks/index';
import { i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { StatusChip } from '@/shared/ui/StatusChip';
import { Text } from '@/shared/ui/Text';
import { TextHtml } from '@/shared/ui/TextHtml';

import styles from './TaskDescription.module.css';

interface TaskDescriptionProps {
	name: string;
	difficulty: TaskDifficulty;
	supportedLanguages: ProgrammingLanguage[];
	mainCategory: TaskCategoryCode;
	description: string;
	companies: Company[];
}

export const TaskDescription = ({
	name,
	difficulty,
	supportedLanguages,
	mainCategory,
	description,
	companies,
}: TaskDescriptionProps) => {
	const t = useTranslations(i18Namespace.tasks);

	return (
		<Card className={styles.wrapper} withOutsideShadow>
			<Flex direction="column" gap="20">
				<Text variant="body6" isMainTitle>
					{name}
				</Text>
				<Flex gap="10" wrap="wrap">
					<TaskDifficultyChip difficulty={difficulty} />
					<ProgrammingLanguageList supportedLanguages={supportedLanguages} />
					<StatusChip
						status={{
							variant: 'green',
							text: t(taskCategories[mainCategory]),
						}}
						size="medium"
					/>
					<CompanyCompactList companies={companies} />
				</Flex>
				<TextHtml html={description} />
			</Flex>
		</Card>
	);
};
