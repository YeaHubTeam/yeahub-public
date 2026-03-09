'use client';

import { useTranslations } from 'next-intl';

import { Questions, i18Namespace } from '@/shared/config';
import { BaseFilterSection } from '@/shared/ui/BaseFilterSection';

import { QuestionFilterStatus, QuestionFilterStatusItem } from '../../model/types';

interface StatusFilterSectionProps {
	selectedStatus?: QuestionFilterStatus;
	onChangeStatus: (status: QuestionFilterStatus) => void;
}

export const StatusFilterSection = ({
	onChangeStatus,
	selectedStatus,
}: StatusFilterSectionProps) => {
	const t = useTranslations(i18Namespace.questions);

	const progressStatus: QuestionFilterStatusItem[] = [
		{
			id: 'not-learned',
			title: t(Questions.QUESTIONS_STATUS_UNLEARNED),
			tooltip: '',
		},
		{
			id: 'learned',
			title: t(Questions.QUESTIONS_STATUS_LEARNED),
			tooltip: '',
		},
		{ id: 'all', title: t(Questions.QUESTIONS_STATUS_ALL) },
		{ id: 'favorite', title: t(Questions.QUESTIONS_STATUS_FAVORITE) },
	];

	const preparedData = progressStatus.map((item) => ({
		...item,
		active: item.id === selectedStatus,
	}));

	return (
		<BaseFilterSection
			data={preparedData}
			title={t(Questions.QUESTIONS_STATUS_TITLE)}
			onClick={onChangeStatus}
		/>
	);
};
