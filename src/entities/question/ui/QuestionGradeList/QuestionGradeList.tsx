import { getTranslations } from 'next-intl/server';

import { i18Namespace } from '@/shared/config/i18n/i18n';
import { Questions } from '@/shared/config/i18n/i18nTranslations';
import { Flex } from '@/shared/ui/Flex';
import { GradeChip } from '@/shared/ui/GradeChip';

export interface QuestionGradeListProps {
	className?: string;
	rate: number;
	complexity: number;
	size?: 'small' | 'medium';
}

export const QuestionGradeList = async ({
	className,
	rate,
	complexity,
	size,
}: QuestionGradeListProps) => {
	const t = await getTranslations(i18Namespace.questions);

	return (
		<Flex componentType="ul" gap="24" className={className}>
			<GradeChip label={t(Questions.QUESTIONS_RATE)} value={rate} size={size} />
			<GradeChip label={t(Questions.QUESTIONS_COMPLEXITY)} value={complexity} size={size} />
		</Flex>
	);
};
