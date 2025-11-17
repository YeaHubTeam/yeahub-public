'use server';

import { getTranslations } from 'next-intl/server';

import { Questions, i18Namespace } from '@/shared/config';
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
