import { Question } from '@/entities/question';
import { Flex } from '@/shared/ui/Flex';

import { InterviewQuestionsItem } from '../InterviewQuestionsItem/InterviewQuestionsItem';

interface InterviewQuestionsListProps {
	questions: Question[];
	specialization: string;
	locale: string;
}

export const InterviewQuestionsList = ({
	questions,
	specialization,
	locale,
}: InterviewQuestionsListProps) => {
	return (
		<Flex direction="column" gap="20">
			{questions.map((question) => (
				<InterviewQuestionsItem
					key={question.id}
					question={question}
					specialization={specialization}
					locale={locale}
				/>
			))}
		</Flex>
	);
};
