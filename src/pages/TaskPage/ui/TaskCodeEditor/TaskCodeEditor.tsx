'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import type { ExecuteCodeRequest, ExecuteCodeResponse, Task } from '@/entities/task';
import { executeCode, testCode } from '@/entities/task';
import { useLazyFetchData } from '@/shared/api';
import { Task as TaskTranslations, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './TaskCodeEditor.module.css';

interface TaskCodeEditorProps {
	task: Task;
}

export const TaskCodeEditor = ({ task }: TaskCodeEditorProps) => {
	const t = useTranslations(i18Namespace.task);

	const defaultLanguageId = task.taskStructures?.[0]?.languageId ?? task.langIds?.[0];
	const defaultTemplate = task.taskStructures?.[0]?.solutionTemplate ?? '';

	const [sourceCode, setSourceCode] = useState(defaultTemplate);

	const {
		data: runResult,
		loading: runLoading,
		fetch: runCode,
	} = useLazyFetchData<ExecuteCodeResponse, ExecuteCodeRequest>({
		fetcher: testCode,
		initialData: null,
	});

	const {
		data: submitResult,
		loading: submitLoading,
		fetch: submitCode,
	} = useLazyFetchData<ExecuteCodeResponse, ExecuteCodeRequest>({
		fetcher: executeCode,
		initialData: null,
	});

	const result = submitResult ?? runResult;
	const isLoading = runLoading || submitLoading;

	const handleRun = () => {
		if (!defaultLanguageId) return;
		void runCode({ taskId: task.id, sourceCode, languageId: defaultLanguageId });
	};

	const handleSubmit = () => {
		if (!defaultLanguageId) return;
		void submitCode({ taskId: task.id, sourceCode, languageId: defaultLanguageId });
	};

	return (
		<Flex direction="column" gap="16" className={styles.wrapper}>
			<textarea
				className={styles.editor}
				value={sourceCode}
				onChange={(e) => setSourceCode(e.target.value)}
				spellCheck={false}
			/>

			<Flex gap="12">
				<Button
					variant="secondary"
					size="medium"
					onClick={handleRun}
					disabled={isLoading || !defaultLanguageId}
				>
					{t(TaskTranslations.EDITOR_ACTIONS_RUN)}
				</Button>

				<Button
					variant="primary"
					size="medium"
					onClick={handleSubmit}
					disabled={isLoading || !defaultLanguageId}
				>
					{t(TaskTranslations.EDITOR_ACTIONS_SUBMIT)}
				</Button>
			</Flex>

			{result && (
				<Flex direction="column" gap="8" className={styles.output}>
					<Text variant="body3">
						{t(TaskTranslations.OUTPUT_RESULT_TESTS_PASSED)}: {result.passed_tests} /{' '}
						{result.total_tests}
					</Text>

					{result.compilation_error && (
						<Text variant="body3" className={styles.error}>
							{t(TaskTranslations.OUTPUT_RESULT_COMPILATION_ERROR)}: {result.compilation_error}
						</Text>
					)}

					{result.test_cases
						.filter((tc) => !tc.is_hidden)
						.map((tc, i) => (
							<Flex
								key={i}
								direction="column"
								gap="4"
								className={tc.status === 'PASS' ? styles['test-passed'] : styles['test-failed']}
							>
								<Text variant="body4">
									{t(TaskTranslations.OUTPUT_TESTS_TEST_CASE_TITLE, { index: i + 1 })} —{' '}
									{tc.status === 'PASS'
										? t(TaskTranslations.OUTPUT_TESTS_TEST_CASE_PASSED)
										: t(TaskTranslations.OUTPUT_TESTS_TEST_CASE_FAILED)}
								</Text>
								{tc.error_message && (
									<Text variant="body4" className={styles.error}>
										{tc.error_message}
									</Text>
								)}
							</Flex>
						))}
				</Flex>
			)}
		</Flex>
	);
};
