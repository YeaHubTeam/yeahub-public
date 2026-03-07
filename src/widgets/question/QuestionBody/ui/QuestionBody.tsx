import { useTranslations } from 'next-intl';

import { AUTH_LINKS, Questions, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { SimpleStub } from '@/shared/ui/SimpleStub';
import { TextHtml } from '@/shared/ui/TextHtml';

import styles from './QuestionBody.module.css';

interface QuestionBodyProps {
	shortAnswer: string;
}

export const QuestionBody = ({ shortAnswer }: QuestionBodyProps) => {
	const t = useTranslations(i18Namespace.questions);

	return (
		<>
			<Card
				title={t(Questions.SHORT_ANSWER_TITLE)}
				withOutsideShadow
				className={styles['short-block']}
			>
				<TextHtml html={shortAnswer} />
			</Card>
			<Card
				title={t(Questions.LONG_ANSWER_TITLE)}
				withOutsideShadow
				className={styles['long-block']}
				actionRoute={AUTH_LINKS.register}
				actionTitle={t(Questions.REGISTER)}
			>
				<SimpleStub variant="no-authorized" text={t(Questions.STUB_NOT_AUTH_TITLE)} />
			</Card>
		</>
	);
};
