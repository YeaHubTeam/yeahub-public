'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { LS_ACTIVE_MOCK_TEST_KEY, useCreateMockTest } from '@/entities/test';
import { TestCreate, i18Namespace } from '@/shared/config';
import { setToLS } from '@/shared/libs';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import type { CreateTestFilterParams } from '../../model/types/filters';
import styles from './CreateTestButton.module.css';

interface CreateTestButtonProps {
	filter: CreateTestFilterParams;
}

export const CreateTestButton = ({ filter }: CreateTestButtonProps) => {
	const t = useTranslations(i18Namespace.testCreate);
	const [errorKey, setErrorKey] = useState<TestCreate | null>(null);
	const { fetch, loading } = useCreateMockTest({
		onSuccess: (data) => {
			try {
				setToLS(LS_ACTIVE_MOCK_TEST_KEY, data);
			} catch {
				setErrorKey(TestCreate.ERROR_STORAGE);
			}
		},
		onError: (error) => {
			const status =
				error instanceof Error && error.cause instanceof Response ? error.cause.status : undefined;

			if (status === 404) {
				setErrorKey(TestCreate.ERROR_QUESTIONS_NOT_FOUND);
			} else if (status === 401) {
				setErrorKey(TestCreate.ERROR_UNAUTHORIZED);
			} else {
				setErrorKey(TestCreate.ERROR_REQUEST);
			}
		},
	});

	const onCreateMockTest = () => {
		setErrorKey(null);
		void fetch({
			specialization: filter.specialization,
			skills: filter.skills?.length ? filter.skills.join(',') : undefined,
			complexity: filter.complexity?.length ? filter.complexity.join(',') : undefined,
			limit: filter.limit ?? 20,
		});
	};

	return (
		<Flex direction="column" gap="12">
			{errorKey && (
				<div role="alert">
					<Text variant="body3" color="red-600">
						{t(errorKey)}
					</Text>
				</div>
			)}
			<Button
				className={styles.button}
				onClick={onCreateMockTest}
				disabled={loading}
				aria-busy={loading}
				suffix={<Icon icon="arrowRight" size={24} />}
			>
				{t(TestCreate.CREATE_BUTTON)}
			</Button>
		</Flex>
	);
};
