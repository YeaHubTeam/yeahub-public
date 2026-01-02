'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { InterviewQuizCreate, i18Namespace } from '@/shared/config';
import { BaseFilterSection } from '@/shared/ui/BaseFilterSection';
import { Tooltip } from '@/shared/ui/Tooltip';

import type { QuestionModeType } from '../../model/types/quiz';

interface QuizQuestionModeProps {
	disabled?: boolean;
}

interface QuizQuestionModeData {
	id: number;
	value: QuestionModeType;
	title: string;
	active: boolean;
}

export const QuizQuestionMode = ({ disabled }: QuizQuestionModeProps) => {
	const t = useTranslations(i18Namespace.interviewQuizCreate);

	const quizQuestionModeData: QuizQuestionModeData[] = [
		{ id: 1, value: 'REPEAT', title: t(InterviewQuizCreate.MODE_REPEAT), active: false },
		{ id: 2, value: 'NEW', title: t(InterviewQuizCreate.MODE_NEW), active: false },
		{ id: 3, value: 'RANDOM', title: t(InterviewQuizCreate.MODE_RANDOM), active: false },
	];

	const [quizQuestionMode, setQuizQuestionMode] = useState(quizQuestionModeData);

	const onChooseMode = (id: number) => {
		const updatedModeData = quizQuestionMode.map((mode) => ({
			...mode,
			active: mode.id === id,
		}));
		setQuizQuestionMode(updatedModeData);
	};

	const tooltipTitle = t(InterviewQuizCreate.MODE_SELECT_TOOLTIP_PREMIUMONLY);

	return (
		<div style={{ maxWidth: '384px' }}>
			<Tooltip
				title={tooltipTitle}
				placement="top"
				color="violet"
				offsetTooltip={0}
				tooltipDelay={{ open: 0, close: 150 }}
				shouldShowTooltip={disabled || false}
			>
				<BaseFilterSection
					data={quizQuestionModeData}
					title={t(InterviewQuizCreate.MODE_SELECT)}
					onClick={onChooseMode}
					disabled={disabled}
				/>
			</Tooltip>
		</div>
	);
};
