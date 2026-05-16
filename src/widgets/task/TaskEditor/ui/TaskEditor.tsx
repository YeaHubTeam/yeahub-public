'use client';

import { useCallback, useState } from 'react';

import MonacoEditor from '@monaco-editor/react';

import { ProgrammingLanguage, ProgrammingLanguageSelect } from '@/entities/programmingLanguage';
import { TaskStructure } from '@/entities/tasks';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui/IconButton';

import styles from './TaskEditor.module.css';

interface TaskEditorProps {
	supportedLanguages: ProgrammingLanguage[];
	taskStructures: TaskStructure[];
}

export const TaskEditor = ({ supportedLanguages, taskStructures }: TaskEditorProps) => {
	const [code, setCode] = useState<string>(taskStructures[0].solutionStub || '');
	const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>(
		supportedLanguages[0],
	);

	const currentLanguage = supportedLanguages.find((lang) => lang.id === selectedLanguage.id);

	const taskStructure = taskStructures.find(({ languageId }) => languageId === selectedLanguage.id);

	const onChangeSelectedLanguage = (languageId: number) => {
		const selectedLanguage =
			supportedLanguages.find(({ id }) => id === languageId) || supportedLanguages[0];
		setSelectedLanguage(selectedLanguage);
		setCode(
			(
				taskStructures.find((taskStructure) => taskStructure.languageId === languageId) ||
				taskStructures[0]
			).solutionStub,
		);
	};

	const handleReset = useCallback(() => {
		setCode(taskStructure?.solutionStub || '');
	}, [taskStructure]);

	return (
		<Flex direction="column" gap="16" className={styles.wrapper}>
			<Card size="small" withOutsideShadow className={styles.header}>
				<Flex align="center" justify="between" gap="24" wrap="wrap">
					<Flex gap="12" align="center">
						<ProgrammingLanguageSelect
							width={200}
							value={String(selectedLanguage.id)}
							onChange={(value) => {
								onChangeSelectedLanguage(Number(value));
							}}
							supportedLanguages={supportedLanguages}
						/>
						<IconButton size="large" icon={<Icon icon="refresh" />} onClick={handleReset} />
					</Flex>
				</Flex>
			</Card>
			<Card size="small" withOutsideShadow className={styles.block} contentClassName={styles.block}>
				<div className={styles.editor}>
					<MonacoEditor
						height={'100%'}
						width={'100%'}
						className={styles.editorItem}
						defaultLanguage={currentLanguage?.monacoLangId}
						onChange={(value) => setCode(value || '')}
						theme="vs-light"
						value={code || ''}
						options={{
							minimap: { enabled: false },
							scrollBeyondLastLine: false,
							fontSize: 14,
						}}
					/>
				</div>
			</Card>
		</Flex>
	);
};
