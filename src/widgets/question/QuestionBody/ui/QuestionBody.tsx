import { useTranslations } from 'next-intl';

import { Questions, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';
import { TextHtml } from '@/shared/ui/TextHtml';

import styles from './QuestionBody.module.css';

interface QuestionBodyProps {
	shortAnswer: string;
	longAnswer: string;
}

export const QuestionBody = ({ shortAnswer, longAnswer }: QuestionBodyProps) => {
	const t = useTranslations(i18Namespace.questions);

	return (
		<>
			<Card
				titleComponent={
					<Text variant="head2" className={styles['title-preview']}>
						{t(Questions.SHORT_ANSWER_TITLE)}
					</Text>
				}
				withOutsideShadow
				className={styles['short-block']}
			>
				<TextHtml html={shortAnswer} />
			</Card>
			<Card
				titleComponent={
					<Text variant="head2" className={styles['title-preview']}>
						{t(Questions.LONG_ANSWER_TITLE)}
					</Text>
				}
				withOutsideShadow
				className={styles['long-block']}
			>
				<TextHtml html={longAnswer} />
			</Card>
		</>
	);
};
