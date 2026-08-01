import { useTranslations } from 'next-intl';

import { InterviewQuizResult, i18Namespace } from '@/shared/config';
import { useModal } from '@/shared/libs';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';

import { QuizResultModal } from '../QuizResultModal/QuizResultModal';
import styles from './QuizResultButton.module.css';

export const QuizResultButton = () => {
	const t = useTranslations(i18Namespace.interviewQuizResult);

	const { isOpen, onOpen, onClose } = useModal();

	return (
		<>
			<Button
				variant="link"
				className={styles.button}
				suffix={<Icon icon="arrowRight" className={styles.icon} />}
				onClick={onOpen}
			>
				{t(InterviewQuizResult.INTERVIEW_STATISTIC_LINK)}
			</Button>
			<QuizResultModal isOpen={isOpen} onClose={onClose} />
		</>
	);
};
