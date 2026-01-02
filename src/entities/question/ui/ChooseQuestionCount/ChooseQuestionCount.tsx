import { useTranslations } from 'next-intl';

import { InterviewQuizCreate, Questions, i18Namespace } from '@/shared/config';
import { MAX_CHOOSE_QUESTION_COUNT } from '@/shared/libs';
import { Counter } from '@/shared/ui/Counter';
import { Text } from '@/shared/ui/Text';
import { Tooltip } from '@/shared/ui/Tooltip';

import styles from './ChooseQuestionCount.module.css';

interface ChooseQuestionCountProps {
	onChangeCount: (limit: number) => void;
	count: number;
	maxCount?: number;
}

export const ChooseQuestionCount = ({
	onChangeCount,
	count,
	maxCount = MAX_CHOOSE_QUESTION_COUNT,
}: ChooseQuestionCountProps) => {
	const tQuestions = useTranslations(i18Namespace.questions);
	const tQuiz = useTranslations(i18Namespace.interviewQuizCreate);

	const onChange = (counter: number) => {
		onChangeCount(counter);
	};

	const isTooltipVisible = maxCount !== undefined && count >= maxCount;
	const tooltipTitle = tQuiz(InterviewQuizCreate.MODE_SELECT_TOOLTIP_PREMIUMONLY);
	return (
		<div style={{ maxWidth: '290px' }}>
			<Tooltip
				title={tooltipTitle}
				placement="top"
				color="violet"
				offsetTooltip={0}
				tooltipDelay={{ open: 0, close: 150 }}
				shouldShowTooltip={isTooltipVisible || false}
			>
				<Text className={styles.title} variant="body3">
					{tQuestions(Questions.COUNT)}
				</Text>
				<Counter count={count} onChange={onChange} maxCount={maxCount} />
			</Tooltip>
		</div>
	);
};
