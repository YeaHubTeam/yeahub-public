'use client';

import type { ReactNode } from 'react';

import { QuestionNavigationButtons } from '@/features/question/navigateQuestion';
import { LearnQuestionButton } from '@/features/quiz/learnQuestion';
import { ResetQuestionStudyProgressButton } from '@/features/quiz/resetQuestionStudyProgress';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';

interface QuestionActionsProps {
	isGuest?: boolean;
	questionId?: number;
	specialization?: { id: number; slug: string };
	checksCount: number;
	isEmailVerified: boolean;
	hasPremium?: boolean;
	isLoading?: boolean;
	onLearn?: () => void;
	onReset?: () => void;
	variant: 'tertiary' | 'link-gray';
	favoriteButton: ReactNode;
	error: ReactNode;
}

export const QuestionActions = ({
	isGuest = false,
	questionId,
	specialization,
	checksCount,
	isEmailVerified,
	hasPremium,
	isLoading,
	onLearn,
	onReset,
	variant,
	favoriteButton,
	error,
}: QuestionActionsProps) => (
	<Card withOutsideShadow>
		<Flex direction="column" gap="12">
			<Flex justify="center" align="center" direction="row" wrap="wrap" gap="20">
				<LearnQuestionButton
					isGuest={isGuest}
					onLearn={onLearn}
					checksCount={checksCount}
					isEmailVerified={isEmailVerified}
					hasPremium={hasPremium}
					isLoading={isLoading}
					variant={variant}
					placementTooltip="top"
					offsetTooltip={5}
				/>
				<ResetQuestionStudyProgressButton
					isGuest={isGuest}
					onReset={onReset}
					checksCount={checksCount}
					isEmailVerified={isEmailVerified}
					hasPremium={hasPremium}
					isLoading={isLoading}
					variant={variant}
					placementTooltip="top"
					offsetTooltip={5}
				/>
				{favoriteButton}
			</Flex>
			<QuestionNavigationButtons variant={variant} questionId={questionId} specialization={specialization} />
			{error}
		</Flex>
	</Card>
);
