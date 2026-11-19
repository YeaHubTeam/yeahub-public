'use client';

import { Suspense } from 'react';

import { useTranslations } from 'next-intl';

import type { PersonalNavigationPageReader, QuestionPersonalStateResult } from '@/entities/question';

import { i18Namespace } from '@/shared/config';
import { Button, ButtonSkeleton } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';

import { useQuestionNavigation } from '../model/useQuestionNavigation';

interface QuestionNavigationButtonsProps {
	variant?: 'tertiary' | 'link-gray';
	readPersonalPage?: PersonalNavigationPageReader;
	personalState?: Extract<QuestionPersonalStateResult, { status: 'success' }>;
	questionId?: number;
	specialization?: { id: number; slug: string };
}

const QuestionNavigationButtonsContent = ({
	variant,
	questionId,
	specialization,
	readPersonalPage,
	personalState,
}: QuestionNavigationButtonsProps) => {
	const t = useTranslations(i18Namespace.questions);
	const { onMovePrev, onMoveNext, isDisabled } = useQuestionNavigation({ questionId, specialization, readPersonalPage, personalState });

	return (
		<Flex justify="center" gap="20">
			<Button
				variant={variant}
				preffix={<Icon icon="altArrowLeft" color="black-600" size={24} />}
				onClick={isDisabled ? undefined : onMovePrev}
				disabled={isDisabled || !onMovePrev}
				aria-disabled={isDisabled || !onMovePrev}
			>
				{t('navigation.previous')}
			</Button>
			<Button
				variant={variant}
				suffix={<Icon icon="altArrowRight" color="black-600" size={24} />}
				onClick={isDisabled ? undefined : onMoveNext}
				disabled={isDisabled || !onMoveNext}
				aria-disabled={isDisabled || !onMoveNext}
			>
				{t('navigation.next')}
			</Button>
		</Flex>
	);
};

// Keep the public detail route static; only query-dependent navigation may suspend.
export const QuestionNavigationButtons = (props: QuestionNavigationButtonsProps) => (
	<Suspense fallback={
		<Flex justify="center" gap="20">
			<ButtonSkeleton variant={props.variant} />
			<ButtonSkeleton variant={props.variant} />
		</Flex>
	}>
		<QuestionNavigationButtonsContent {...props} />
	</Suspense>
);
