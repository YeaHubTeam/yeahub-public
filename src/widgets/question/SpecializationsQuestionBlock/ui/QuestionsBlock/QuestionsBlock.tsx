import Link from 'next/link';

import { useTranslations } from 'next-intl';

import { Question } from '@/entities/question';
import { ROUTES, Specializations, i18Namespace } from '@/shared/config';
import { route } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import { InterviewQuestionsList } from '../InterviewQuestionsList/InterviewQuestionsList';
import styles from './QuestionsBlock.module.css';

interface QuestionBlockProps {
	specialization: string;
	questions: Question[];
	locale: string;
}

export const QuestionsBlock = ({ specialization, questions, locale }: QuestionBlockProps) => {
	const t = useTranslations(i18Namespace.specialization);
	const questionsListRoute = route(ROUTES.questions.page, specialization);

	return (
		<Flex direction="column" className={styles.container} gap="14" dataTestId="QuestionBlock">
			<Flex direction="row" justify="between">
				<Text variant="head3" className={styles.title}>
					{t(Specializations.QUESTIONS_NEW_TITLE)}
				</Text>
				<Link href={questionsListRoute} className={styles.link}>
					{t(Specializations.QUESTIONS_LINK)}
					<Icon icon="arrowRight" size={24} />
				</Link>
			</Flex>

			<InterviewQuestionsList
				specialization={specialization}
				questions={questions}
				locale={locale}
			/>
		</Flex>
	);
};
