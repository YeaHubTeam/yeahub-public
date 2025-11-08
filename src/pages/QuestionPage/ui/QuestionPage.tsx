import { Question } from '@/entities/question';
import { BackButton } from '@/shared/ui/BackButton';
import { Flex } from '@/shared/ui/Flex';
import { QuestionAdditionalInfo } from '@/widgets/question/QuestionAdditionalInfo';
import { QuestionBody } from '@/widgets/question/QuestionBody';
import { QuestionHeader } from '@/widgets/question/QuestionHeader';

import styles from './QuestionPage.module.css';

interface QuestionPageProps {
	question: Question;
	questionsRoute: string;
}

export const QuestionPage = ({ question, questionsRoute }: QuestionPageProps) => {
	if (!question) {
		return null;
	}

	const {
		createdBy,
		rate,
		keywords,
		complexity,
		questionSkills,
		shortAnswer,
		longAnswer,
		questionSpecializations,
	} = question;

	return (
		<Flex direction="column" align="start">
			<Flex>
				<BackButton />
			</Flex>
			<Flex gap="20" maxWidth>
				<Flex gap="20" direction="column" flex={1} maxWidth>
					<QuestionHeader question={question} />
					<QuestionBody shortAnswer={shortAnswer} longAnswer={longAnswer} />
				</Flex>
				<Flex direction="column" gap="20" className={styles.additional}>
					<QuestionAdditionalInfo
						rate={rate}
						createdBy={createdBy}
						keywords={keywords}
						complexity={complexity}
						questionSkills={questionSkills}
						route={questionsRoute}
						questionSpecializations={questionSpecializations}
					/>
				</Flex>
			</Flex>
		</Flex>
	);
};
