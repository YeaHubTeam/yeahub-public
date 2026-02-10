import { useTranslations } from 'next-intl';

import { Question } from '@/entities/question';
import { Questions as QuestionsTranslations, i18Namespace } from '@/shared/config';
import { Accordion } from '@/shared/ui/Accordion';
import { Text } from '@/shared/ui/Text';

import { FullQuestionItem } from '../FullQuestionItem/FullQuestionItem';
import styles from './FullQuestionsList.module.css';

interface FullQuestionsListProps {
	questions: Question[];
	specialization: string;
	specializationTitle: string;
}

export const FullQuestionsList = ({
	questions,
	specialization,
	specializationTitle,
}: FullQuestionsListProps) => {
	const t = useTranslations(i18Namespace.questions);

	const title = t(QuestionsTranslations.QUESTIONS_TITLE, {
		specialization: specializationTitle,
	});

	return (
		<>
			<div className={styles['questions-list-header']}>
				<Text variant={'body6'} isMainTitle maxRows={1}>
					{title}
				</Text>
			</div>
			<hr className={styles.divider} />
			{questions.map((question) => (
				<Accordion key={question.id} title={question.title} className={styles.gap}>
					<FullQuestionItem question={question} specialization={specialization} />
				</Accordion>
			))}
		</>
	);
};
