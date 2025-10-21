import { useTranslations } from 'next-intl';

import { Question } from '@/entities/questions';
import { Questions as QuestionsTranslations, i18Namespace } from '@/shared/config';
import { SPEC_MAP, SPEC_MAP_TO_TITLE } from '@/shared/constants';
import { Accordion } from '@/shared/ui/Accordion';
import { Text } from '@/shared/ui/Text';

import { FullQuestionItem } from '../FullQuestionItem/FullQuestionItem';
import styles from './FullQuestionsList.module.css';

interface FullQuestionsListProps {
	questions: Question[];
	specialization: keyof typeof SPEC_MAP;
}

export const FullQuestionsList = ({ questions, specialization }: FullQuestionsListProps) => {
	const t = useTranslations(i18Namespace.questions);

	const title = t(QuestionsTranslations.QUESTIONS_TITLE, {
		specialization: SPEC_MAP_TO_TITLE[specialization],
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
					<FullQuestionItem question={question} />
				</Accordion>
			))}
		</>
	);
};
