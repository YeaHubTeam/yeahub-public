import { getTranslations } from 'next-intl/server';

import { PreviewQuestionsItem, getQuestionsList } from '@/entities/question';
import { Specialization } from '@/entities/specialization';
import { ROUTES, Specializations, i18Namespace } from '@/shared/config';
import { route } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';

interface QuestionsSectionProps {
	specialization: Specialization;
	locale: string;
}

export const QuestionsSection = async ({ specialization, locale }: QuestionsSectionProps) => {
	const t = await getTranslations(i18Namespace.specialization);
	const questionsListRoute = route(ROUTES.questions.page, specialization.slug);
	const questionsResponse = await getQuestionsList({
		page: 1,
		limit: 4,
		specializationId: specialization.id,
	});

	if (!questionsResponse || questionsResponse?.data?.length === 0) {
		return null;
	}
	return (
		<SectionWrapper
			title={t(Specializations.QUESTIONS_NEW_TITLE)}
			actionTitle={t(Specializations.QUESTIONS_LINK)}
			actionRoute={questionsListRoute}
		>
			<Flex componentType="ul" direction="column" gap="20">
				{questionsResponse.data.map((question) => (
					<PreviewQuestionsItem
						key={question.id}
						title={question.title}
						specialization={specialization.slug}
						slug={question.slug}
						locale={locale}
						rate={question.rate}
						complexity={question.complexity}
					/>
				))}
			</Flex>
		</SectionWrapper>
	);
};
