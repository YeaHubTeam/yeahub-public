import {
	getGuruWithMatchingSpecialization,
	getNewGuruWithMatchingSpecialization,
} from '@/entities/guru';
import { Question } from '@/entities/question';
import { BackButton } from '@/shared/ui/BackButton';
import { Flex } from '@/shared/ui/Flex';
import { SidebarBanner } from '@/widgets/Media';
import { QuestionAdditionalInfo } from '@/widgets/question/QuestionAdditionalInfo';
import { QuestionBody } from '@/widgets/question/QuestionBody';
import { QuestionHeader } from '@/widgets/question/QuestionHeader';

import styles from './QuestionPage.module.css';

interface QuestionPageProps {
	question: Question;
}

export const QuestionPage = ({ question }: QuestionPageProps) => {
	if (!question) {
		return null;
	}

	const {
		rate,
		keywords,
		complexity,
		questionSkills,
		shortAnswer,
		longAnswer,
		questionSpecializations,
	} = question;

	const guru = getGuruWithMatchingSpecialization(questionSpecializations || []);
	const newGuru = getNewGuruWithMatchingSpecialization(questionSpecializations);

	return (
		<Flex direction="column" align="start">
			<Flex>
				<BackButton />
			</Flex>
			<Flex gap="20" maxWidth>
				<Flex gap="20" direction="column" flex={1} maxWidth>
					<QuestionHeader question={question} />
					<QuestionBody shortAnswer={shortAnswer} longAnswer={longAnswer} />
					<div className={styles.banner}>
						<SidebarBanner guru={guru} newGuru={newGuru} />
					</div>
				</Flex>
				<Flex direction="column" gap="20" className={styles.additional}>
					<QuestionAdditionalInfo
						rate={rate}
						keywords={keywords}
						complexity={complexity}
						questionSkills={questionSkills}
						questionSpecializations={questionSpecializations}
					/>
					<SidebarBanner guru={guru} newGuru={newGuru} />
				</Flex>
			</Flex>
		</Flex>
	);
};
