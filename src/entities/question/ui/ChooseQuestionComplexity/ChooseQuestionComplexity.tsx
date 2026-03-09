import { useTranslations } from 'next-intl';

import { Questions, Translation, i18Namespace } from '@/shared/config';
import { BaseFilterSection } from '@/shared/ui/BaseFilterSection';
import { Tooltip } from '@/shared/ui/Tooltip';

import { QUESTIONS_COMPLEXITY } from '../../model/constants/question';

interface ChooseQuestionComplexityProps {
	selectedComplexity?: number[];
	onChangeComplexity: (complexity?: number[]) => void;
	disabled?: boolean;
}

export const ChooseQuestionComplexity = ({
	selectedComplexity,
	onChangeComplexity,
	disabled,
}: ChooseQuestionComplexityProps) => {
	const t = useTranslations(i18Namespace.questions);
	const tTranslation = useTranslations(i18Namespace.translation);

	const onChooseComplexity = (id: number) => {
		const newValues = QUESTIONS_COMPLEXITY.find((item) => item.id === id)?.value || [];
		const isDataExist = selectedComplexity?.some((item) => newValues.includes(item));
		const updates = isDataExist
			? (selectedComplexity || []).filter((item) => !newValues.includes(item))
			: [...(selectedComplexity || []), ...newValues];
		onChangeComplexity(updates.length === 0 ? undefined : updates);
	};

	const preparedData = QUESTIONS_COMPLEXITY.map((item) => ({
		...item,
		active: selectedComplexity?.some((selectedItem) => item.value.includes(selectedItem)),
	}));

	return (
		<div style={{ maxWidth: '290px' }}>
			<Tooltip
				title={tTranslation(Translation.MODE_SELECT_TOOLTIP_PREMIUM_ONLY)}
				placement="top"
				color="violet"
				offsetTooltip={0}
				tooltipDelay={{ open: 0, close: 150 }}
				shouldShowTooltip={disabled || false}
			>
				<BaseFilterSection
					data={preparedData}
					title={t(Questions.QUESTIONS_COMPLEXITY)}
					onClick={onChooseComplexity}
					disabled={disabled}
				/>
			</Tooltip>
		</div>
	);
};
