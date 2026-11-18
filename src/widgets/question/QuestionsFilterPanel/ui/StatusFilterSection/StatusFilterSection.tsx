'use client';

import { useTranslations } from 'next-intl';

import { Questions, i18Namespace } from '@/shared/config';
import { BaseFilterSection } from '@/shared/ui/BaseFilterSection';

import { QuestionFilterStatus, QuestionFilterStatusItem } from '../../model/types';

interface StatusFilterSectionProps {
	selectedStatus?: QuestionFilterStatus;
	onChangeStatus?: (status: QuestionFilterStatus) => void;
	hasPremium?: boolean;
}

export const StatusFilterSection = ({
	onChangeStatus,
	selectedStatus = 'all',
	hasPremium = false,
}: StatusFilterSectionProps) => {
	const t = useTranslations(i18Namespace.questions);
	const tSubscription = useTranslations(i18Namespace.subscription);

	const progressStatus: QuestionFilterStatusItem[] = [
		{
			id: 'not-learned',
			title: t(Questions.QUESTIONS_STATUS_UNLEARNED),
			tooltip: !hasPremium ? tSubscription('changeTariffPlan') : undefined,
			disabled: !hasPremium,
		},
		{
			id: 'learned',
			title: t(Questions.QUESTIONS_STATUS_LEARNED),
			tooltip: !hasPremium ? tSubscription('changeTariffPlan') : undefined,
			disabled: !hasPremium,
		},
		{ id: 'all', title: t(Questions.QUESTIONS_STATUS_ALL) },
		{ id: 'favorite', title: t(Questions.QUESTIONS_STATUS_FAVORITE) },
	];

	const preparedData = progressStatus.map((item) => ({
		...item,
		active: item.id === selectedStatus,
		disabled: !onChangeStatus || item.disabled,
	}));

	return (
		<BaseFilterSection
			data={preparedData}
			title={t(Questions.QUESTIONS_STATUS_TITLE)}
			onClick={(status) => {
				const item = preparedData.find((item) => item.id === status);
				if (!item?.disabled) onChangeStatus?.(status);
			}}
		/>
	);
};
