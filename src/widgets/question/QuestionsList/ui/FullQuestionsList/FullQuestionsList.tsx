import { Question } from '@/entities/question';
import { Accordion } from '@/shared/ui/Accordion';
import { Text } from '@/shared/ui/Text';

import { FullQuestionItem } from '../FullQuestionItem/FullQuestionItem';
import styles from './FullQuestionsList.module.css';

interface FullQuestionsListProps {
	questions: Question[];
	additionalTitle?: string;
	filterButton?: React.ReactNode;
}

export const FullQuestionsList = ({
	questions,
	additionalTitle,
	filterButton,
}: FullQuestionsListProps) => {
	// TODO: После подключения фильтрации получать заголовок из API
	const title = additionalTitle || 'Вопросы React Frontend Developer';

	return (
		<>
			<div className={styles['questions-list-header']}>
				<Text variant={'body6'} isMainTitle maxRows={1}>
					{title}
				</Text>
				{filterButton}
			</div>
			<hr className={styles.divider} />
			{questions.map((question) => (
				<Accordion key={question.id} title={question.title} className={styles.gap}>
					<FullQuestionItem question={question} />
				</Accordion>
			))}
		</>
	);
};
