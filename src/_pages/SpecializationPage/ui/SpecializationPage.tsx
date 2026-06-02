import { getQuestionsList } from '@/entities/question';
import { Specialization } from '@/entities/specialization';
import { Flex } from '@/shared/ui/Flex';
import { Header } from '@/widgets/Specialization/Header';
import { QuestionsBlock } from '@/widgets/question/SpecializationsQuestionBlock';

interface SpecializationPageProps {
	specialization: Specialization;
	locale: string;
}

const FIRST_PAGE = 1;
const MAX_QUSTIONS_COUNT = 4;

export const SpecializationPage = async ({ specialization, locale }: SpecializationPageProps) => {
	const questionsResponse = await getQuestionsList({
		page: FIRST_PAGE,
		limit: MAX_QUSTIONS_COUNT,
		specializationId: specialization.id,
	});

	return (
		<Flex direction="column" gap="40">
			<Header specialization={specialization} />
			<QuestionsBlock
				locale={locale}
				specialization={specialization.slug}
				questions={questionsResponse.data}
			/>
		</Flex>
	);
};
