import { useLocale } from 'next-intl';

import { Flex } from '@/shared/ui/Flex';

import { quizImage2, trainerInterview } from '../../model/assets';
import { InterviewCard } from '../InterviewCard/InterviewCard';
import styles from './AdditionalBlock.module.css';

interface AdditionalBlockProps {
	textFirst: string;
	textSecond: string;
}

export const AdditionalBlock = ({ textFirst, textSecond }: AdditionalBlockProps) => {
	const locale = useLocale();

	return (
		<Flex direction="column" className={styles['additional-block']}>
			<InterviewCard iconType="student" img={quizImage2} text={textFirst} locale={locale} />
			<InterviewCard iconType="settings" img={trainerInterview} text={textSecond} locale={locale} />
		</Flex>
	);
};
